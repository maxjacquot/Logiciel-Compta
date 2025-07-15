import re
from flask import Flask, request, send_file, jsonify
import openpyxl
import tempfile
import os
import csv
from io import BytesIO, StringIO


from flask_cors import CORS

app = Flask(__name__)
# Limite la taille des uploads à 10 Mo
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
# CORS restrict to frontend domain in prod (ex: 'https://monfront.com')
CORS(app, resources={r"/*": {"origins": "*"}})  # À restreindre en prod


# Utilitaires pour injection (à adapter selon ta logique métier)
def inject_data(wb, mois, annee, csv_files):

    def clean_float(val):
        if not val:
            return 0
        val = re.sub(r"[^0-9,.-]", "", val)  # garde chiffres, virgule, point, moins
        val = val.replace(",", ".")
        try:
            return float(val)
        except Exception:
            return 0

    # Recherche de la feuille année
    ws = None
    for sheet in wb.worksheets:
        if sheet.title == str(annee):
            ws = sheet
            break
    if ws is None:
        raise Exception(f"Feuille {annee} non trouvée")

    # Recherche de la ligne de début du mois
    start_row = None
    for row in ws.iter_rows(min_col=1, max_col=1):
        if row[0].value == mois:
            start_row = row[0].row + 3
            break
    if start_row is None:
        raise Exception(f"Mois {mois} non trouvé")

    # Détermination du nombre de jours
    mois31 = ["JANVIER", "MARS", "MAI", "JUILLET", "AOUT", "OCTOBRE", "DECEMBRE"]
    if mois in mois31:
        nb_jours = 31
    elif mois == "FEVRIER":
        nb_jours = 29 if int(annee) % 4 == 0 else 28
    else:
        nb_jours = 30

    jours_a_sauter = []
    if mois in ["JANVIER", "MAI"]:
        jours_a_sauter = [0]
    elif mois == "DECEMBRE":
        jours_a_sauter = [24]

    # Injection pour chaque jour
    for jour in range(nb_jours):
        if jour in jours_a_sauter:
            continue
        if jour >= len(csv_files):
            continue
        csv_file = csv_files[jour]
        csv_file.stream.seek(0)
        reader = csv.reader(StringIO(csv_file.stream.read().decode("utf-8")))
        rows = list(reader)

        valRJ = 0
        valRL = 0
        for i in range(1, min(31, len(rows))):  # skip header
            row = rows[i]
            type_val = row[1] if len(row) > 1 else None
            d_val = clean_float(row[3]) if len(row) > 3 else 0
            c_val = clean_float(row[2]) if len(row) > 2 else 0
            excel_row = start_row + jour

            if type_val == "Espèces":
                ws[f"B{excel_row}"] = d_val
            if type_val == "Chèque":
                ws[f"C{excel_row}"] = d_val
            if type_val == "CB":
                ws[f"D{excel_row}"] = d_val
            if type_val == "Gain tirage et sport":
                valRL += d_val
            if type_val == "Gain grattage":
                valRJ += d_val
            if type_val == "Especes POINT VERT":
                ws[f"G{excel_row}"] = d_val
                ws[f"H{excel_row}"] = c_val
            if type_val == "Avoir":
                ws[f"K{excel_row}"] = d_val
            if type_val == "REMB. JEU":
                valRJ += d_val
            if type_val == "REMB. LOTO":
                valRL += d_val
            if type_val == "Mise en compte":
                ws[f"J{excel_row}"] = d_val
            if type_val == "Paiement facture":
                ws[f"K{excel_row}"] = c_val
        ws[f"F{start_row + jour}"] = valRL
        ws[f"E{start_row + jour}"] = valRJ
    return wb


@app.route("/traiter-compta", methods=["POST"])
def traiter_compta():
    excel_file = request.files["excel"]
    csv_files = request.files.getlist("csvs")
    mois = request.form["mois"]
    annee = request.form["annee"]
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        excel_file.save(tmp.name)
        wb = openpyxl.load_workbook(tmp.name)
        wb = inject_data(wb, mois, annee, csv_files)
        wb.save(tmp.name)
        tmp.seek(0)
        return send_file(
            tmp.name, as_attachment=True, download_name=f"Compta-{mois}-{annee}.xlsx"
        )


# Pour gunicorn/uwsgi, il suffit d'exposer 'app'
# Exemple de commande gunicorn :
# gunicorn -w 4 -b 0.0.0.0:5000 app:app

if __name__ == "__main__":
    # Pour debug local uniquement
    app.run(port=5000, debug=False)
