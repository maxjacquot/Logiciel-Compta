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