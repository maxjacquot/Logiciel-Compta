import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Composants réutilisables
const FileUploader = ({ label, accept, multiple = false, files, setFiles }) => {
  if (!multiple) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        {files ? (
          <div style={styles.uploadedSingle}>
            <span style={styles.uploadedText}>{files.name}</span>
            <button
              style={styles.deleteIcon}
              onClick={() => setFiles(null)}
              aria-label="Supprimer fichier"
            >
              ×
            </button>
          </div>
        ) : (
          <label style={styles.fileButton}>
            Sélectionner un fichier
            <input
              type="file"
              accept={accept}
              multiple={false}
              onChange={e => setFiles(e.target.files[0])}
              style={styles.hiddenInput}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <label style={styles.fileButton}>
        Sélectionner plusieurs fichiers
        <input
          type="file"
          accept={accept}
          multiple
          onChange={e => setFiles(Array.from(e.target.files))}
          style={styles.hiddenInput}
        />
      </label>
    </div>
  );
};

const SelectInput = ({ label, options, value, onChange }) => (
  <div style={styles.fieldSmall}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={styles.select}>
      <option value="" disabled hidden>{label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

function App() {
  const [fichierCompta, setFichierCompta] = useState(null);
  const [fichesCaisse, setFichesCaisse] = useState([]);
  const [mois, setMois] = useState('');
  const [annee, setAnnee] = useState('');

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(
    () => [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2],
    [currentYear]
  );

  const isFormValid = useMemo(
    () => !!fichierCompta && fichesCaisse.length > 0 && mois && annee,
    [fichierCompta, fichesCaisse, mois, annee]
  );

  const parseComptaFile = useCallback(async file => {
    const data = await file.arrayBuffer();
    return XLSX.read(data, { type: 'array' });
  }, []);

  const parseCsv = useCallback(file => {
    return new Promise(resolve => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: results => resolve(results.data)
      });
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;
    try {
      const wb = await parseComptaFile(fichierCompta);
      const sheetName = annee.toString();
      const ws = wb.Sheets[sheetName];
      if (!ws) throw new Error(`Feuille '${sheetName}' introuvable.`);

      const range = XLSX.utils.decode_range(ws['!ref']);
      let ligneDebut = null;
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cell = ws[`A${r+1}`];
        if (cell?.v === mois) { ligneDebut = r + 4; break; }
      }
      if (!ligneDebut) throw new Error(`Mois '${mois}' introuvable.`);

      const yearNum = +annee;
      const monthIndex = [
        'JANVIER','FEVRIER','MARS','AVRIL','MAI','JUIN',
        'JUILLET','AOUT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DECEMBRE'
      ].indexOf(mois) + 1;
      const nbJours = new Date(yearNum, monthIndex, 0).getDate();

      for (let j = 0; j < nbJours; j++) {
        const file = fichesCaisse[j];
        if (!file) continue;
        const data = await parseCsv(file);
        let valRJ = 0, valRL = 0;
        const targetRow = ligneDebut + j;

        data.slice(0, 30).forEach(row => {
          const label = Object.values(row)[0];
          const value = row.D || 0;
          switch (label) {
            case 'Espèces': ws[`B${targetRow}`] = { v: value }; break;
            case 'Chèque': ws[`C${targetRow}`] = { v: value }; break;
            case 'CB': ws[`D${targetRow}`] = { v: value }; break;
            case 'Gain tirage et sport': valRL += value; break;
            case 'Gain grattage': valRJ += value; break;
            case 'REMB. JEU': valRJ += value; break;
            case 'REMB. LOTO': valRL += value; break;
            case 'Especes POINT VERT': {
              const nb = row.C || 0;
              ws[`G${targetRow}`] = { v: value }; ws[`H${targetRow}`] = { v: nb };
              break;
            }
            case 'Avoir': ws[`K${targetRow}`] = { v: value }; break;
            case 'Mise en compte': ws[`J${targetRow}`] = { v: value }; break;
            case 'Paiement facture': ws[`K${targetRow}`] = { v: value }; break;
            default: break;
          }
        });

        ws[`E${targetRow}`] = { v: valRJ };
        ws[`F${targetRow}`] = { v: valRL };
      }

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Compta-${mois}-${annee}.xlsx`);
      alert('Traitement terminé, fichier généré.');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [isFormValid, fichierCompta, fichesCaisse, mois, annee, parseComptaFile, parseCsv]);

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <div style={styles.formContainer}>
          <h1 style={styles.title}>🧾 Compta Automatique</h1>

          <FileUploader
            label="Fichier de suivi de compta (.xlsx)"
            accept=".xlsx"
            multiple={false}
            files={fichierCompta}
            setFiles={setFichierCompta}
          />

          <FileUploader
            label="Fiches de caisse (.csv)"
            accept=".csv"
            multiple={true}
            files={fichesCaisse}
            setFiles={setFichesCaisse}
          />

          <div style={styles.row}>
            <SelectInput
              label="Mois"
              options={[
                'JANVIER','FEVRIER','MARS','AVRIL','MAI','JUIN',
                'JUILLET','AOUT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DECEMBRE'
              ]}
              value={mois}
              onChange={setMois}
            />
            <SelectInput
              label="Année"
              options={yearOptions}
              value={annee}
              onChange={setAnnee}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              ...styles.submitButton,
              opacity: isFormValid ? 1 : 0.6,
              cursor: isFormValid ? 'pointer' : 'not-allowed'
            }}
            disabled={!isFormValid}
          >
            ▶️ Lancer le traitement
          </button>
        </div>

        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Liste de feuilles de caisse</h2>
          <div style={styles.sidebarContent}>
            {fichesCaisse.length === 0 ? (
              <p style={styles.emptyMsg}>Aucune feuille déposée.</p>
            ) : (
              <ul style={styles.sidebarList}>
                {fichesCaisse.map((file, idx) => (
                  <li key={idx} style={styles.sidebarItem}>
                    {file.name}
                    <button
                      style={styles.deleteIcon}
                      onClick={() => setFichesCaisse(fichesCaisse.filter((_, i) => i !== idx))}
                      aria-label="Supprimer fichier"
                    >×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  page: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb', margin: 0, padding: 0, boxSizing: 'border-box' },
  main: { display: 'flex', gap: '2rem', width: '90%', maxWidth: '900px' },
  formContainer: { flex: 2, backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' },
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#111827', fontSize: '1.75rem' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  fileButton: { display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', border: 'none' },
  hiddenInput: { display: 'none' },
  submitButton: { width: '100%', padding: '0.75rem', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  sidebar: { flex: 1, backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '70vh', overflowY: 'auto', boxSizing: 'border-box' },
  sidebarTitle: { marginBottom: '1rem', fontSize: '1.25rem', color: '#111827' },
  sidebarContent: { fontFamily: 'Arial, sans-serif' },
  emptyMsg: { color: '#6b7280' },
  sidebarList: { listStyle: 'none', padding: 0, margin: 0 },
  sidebarItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid #e5e7eb', color: '#374151' },
  deleteIcon: { background: 'none', border: 'none', color: '#ef4444', fontSize: '1rem', cursor: 'pointer', marginLeft: '0.25rem' },
  uploadedSingle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '6px', boxSizing: 'border-box' },
  uploadedText: { color: '#111827', fontWeight: '500' },
  field: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
  fieldSmall: { flex: 1, display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '0.5rem', fontWeight: '600', color: '#374151' },
  select: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', appearance: 'none' }
};

export default App;
