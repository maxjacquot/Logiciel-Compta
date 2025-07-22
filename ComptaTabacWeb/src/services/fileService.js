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

export async function sendToBackendAndGetBlob({ fichierCompta, fichesCaisse, mois, annee }) {
  const formData = new FormData();
  formData.append('excel', fichierCompta);
  fichesCaisse.forEach(file => formData.append('csvs', file));
  formData.append('mois', mois);
  formData.append('annee', annee);

  const API_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_URL}/traiter-compta`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Erreur lors du traitement côté serveur');
  return await response.blob();
}