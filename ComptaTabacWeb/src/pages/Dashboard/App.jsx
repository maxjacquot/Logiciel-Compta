import React, { useState, useMemo } from 'react';
import FileUploader from '../../components/FileUploader';
import SelectInput from '../../components/SelectInput';
import { useParseCompta } from '../../hooks/useParseCompta';
import { useParseCsv } from '../../hooks/useParseCsv';
import { MONTHS, getYearOptions } from '../../constants/date';
import { findWorksheet, findStartRow } from '../../utils/xlsxHelpers';
import { saveWorkbook, notifyCompletion, notifyError } from '../../services/fileService';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [fichierCompta, setFichierCompta] = useState(null);
  const [fichesCaisse, setFichesCaisse] = useState([]);
  const [mois, setMois] = useState('');
  const [annee, setAnnee] = useState('');

  const yearOptions = useMemo(() => getYearOptions(), []);
  const isFormValid = useMemo(() => fichierCompta && fichesCaisse.length > 0 && mois && annee, [fichierCompta, fichesCaisse, mois, annee]);

  const parseCompta = useParseCompta();
  const parseCsv = useParseCsv();

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      const wb = await parseCompta(fichierCompta);
      const ws = findWorksheet(wb, annee.toString());
      const startRow = findStartRow(ws, mois);
      console.log(startRow);
      const yearNum = +annee;
      const monthIndex = MONTHS.indexOf(mois) + 1;
      const nbJours = new Date(yearNum, monthIndex, 0).getDate();

      for (let j = 0; j < nbJours; j++) {
        const file = fichesCaisse[j];
        if (!file) continue;
        const data = await parseCsv(file);
        console.log(data);
        // ... logique d'injection (identique à l'existant)
      }

      saveWorkbook(wb, mois, annee);
      notifyCompletion();
    } catch (err) {
      console.error(err);
      notifyError(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>🧾 Compta Automatique</h1>
          <FileUploader label="Fichier de suivi de compta (.xlsx)" accept=".xlsx" files={fichierCompta} setFiles={setFichierCompta} />
          <FileUploader label="Fiches de caisse (.csv)" accept=".csv" multiple files={fichesCaisse} setFiles={setFichesCaisse} />
          <div className={styles.row}>
            <SelectInput label="Mois" options={MONTHS} value={mois} onChange={setMois} />
            <SelectInput label="Année" options={yearOptions} value={annee} onChange={setAnnee} />
          </div>
          <button onClick={handleSubmit} className={styles.submitButton} disabled={!isFormValid}>
            ▶️ Lancer le traitement
          </button>
        </div>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Liste de feuilles de caisse</h2>
          <div className={styles.sidebarContent}>
            {fichesCaisse.length === 0 ? <p className={styles.emptyMsg}>Aucune feuille déposée.</p> : (
              <ul className={styles.sidebarList}>
                {fichesCaisse.map((file, idx) => (
                  <li key={idx} className={styles.sidebarItem}>
                    {file.name}
                    <button className={styles.deleteIcon} onClick={() => setFichesCaisse(fc => fc.filter((_, i) => i !== idx))} aria-label="Supprimer fichier">×</button>
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