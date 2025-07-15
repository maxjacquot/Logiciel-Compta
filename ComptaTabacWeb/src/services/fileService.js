// Envoie les fichiers à l'API Python et télécharge le résultat
export const sendToBackendAndDownload = async (fichierCompta, fichesCaisse, mois, annee) => {
  const formData = new FormData();
  formData.append('excel', fichierCompta);
  fichesCaisse.forEach(file => formData.append('csvs', file));
  formData.append('mois', mois);
  formData.append('annee', annee);

  const response = await fetch('http://localhost:5000/traiter-compta', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Erreur lors du traitement côté serveur');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Compta-${mois}-${annee}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const saveWorkbook = (workbook, month, year) => {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    `Compta-${month}-${year}.xlsx`
  );
};

export const notifyCompletion = () => {
  alert('Traitement terminé, fichier généré.');
};

export const notifyError = message => {
  alert(message);
};