import React, { useState, useMemo } from 'react';
import FileUploader from '../../components/FileUploader';
import SelectInput from '../../components/SelectInput';
import { MONTHS, getYearOptions } from '../../constants/date';
// import { sendToBackendAndDownload } from '../../services/fileService';
import styles from './Dashboard.module.css';


export default function Dashboard() {
  const [fichierCompta, setFichierCompta] = useState(null);
  const [fichesCaisse, setFichesCaisse] = useState([]);
  const [mois, setMois] = useState('');
  const [annee, setAnnee] = useState('');
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null); // { type: 'success'|'error', message: string, blob?: Blob }

  const yearOptions = useMemo(() => getYearOptions(), []);
  const isFormValid = useMemo(() => fichierCompta && fichesCaisse.length > 0 && mois && annee, [fichierCompta, fichesCaisse, mois, annee]);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setNotif(null);
    setLoading(true);
    try {
      // Copie de sendToBackendAndDownload mais on récupère le blob pour le bouton
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
      setNotif({ type: 'success', message: 'Traitement terminé !', blob });
    } catch (err) {
      setNotif({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
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
          <button
            onClick={handleSubmit}
            className={styles.blueButton + (loading ? ' ' + styles.disabledButton : '')}
            disabled={!isFormValid || loading}
          >
            ▶️ Executer le programme de feuilles de caisses
          </button>

          {/* Overlay de chargement qui bloque toute l'UI */}
          {loading && (
            <div className={styles.overlayLoading}>
              <div className={styles.loadingBox}>
                <div className={styles.spinner}></div>
                <div className={styles.loadingText}>Traitement en cours...</div>
              </div>
            </div>
          )}

          {/* Notification centrée */}
          {notif && (
            <div className={styles.overlayNotif}>
              <div className={notif.type === 'success' ? styles.notifSuccessBox : styles.notifErrorBox}>
                {notif.type === 'success' ? (
                  <>
                    <div className={styles.notifIcon}>✅</div>
                    <div className={styles.notifMsg}>{notif.message}</div>
                    <button
                      className={styles.downloadButton}
                      onClick={() => {
                        const url = window.URL.createObjectURL(notif.blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Compta-${mois}-${annee}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      📥 Télécharger le document
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.notifIcon}>❌</div>
                    <div className={styles.notifMsg}>Une erreur est survenue : <b>{notif.message}</b></div>
                  </>
                )}
                <button className={styles.closeNotifBtn} onClick={() => setNotif(null)}>Fermer</button>
              </div>
            </div>
          )}
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