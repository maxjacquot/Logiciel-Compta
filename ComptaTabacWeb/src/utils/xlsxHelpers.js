
import * as XLSX from 'xlsx';

export const findWorksheet = (workbook, sheetName) => {
  const ws = workbook.Sheets[sheetName];
  if (!ws) throw new Error(`Feuille '${sheetName}' introuvable.`);
  return ws;
};

export const findStartRow = (ws, monthLabel) => {
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = ws[`A${r+1}`];
    if (cell?.v === monthLabel) return r + 4;
  }
  throw new Error(`Mois '${monthLabel}' introuvable.`);
};