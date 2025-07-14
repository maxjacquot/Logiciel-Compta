import React, { useState, useMemo } from 'react';

// Composants réutilisables
const FileUploader = ({ label, accept, multiple = false, files, setFiles }) => {
  // Cas: fichier unique déjà sélectionné
  if (!multiple && files) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <div style={styles.uploaded}>
          {files.name}
          <button
            style={styles.deleteIcon}
            onClick={() => setFiles(null)}
            aria-label="Supprimer fichier"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Cas: plusieurs fichiers déjà sélectionnés
  if (multiple && files && files.length > 0) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <div style={styles.uploaded}>{files.length} fichiers déposés</div>
        <ul style={styles.fileList}>
          {files.map((file, idx) => (
            <li key={idx} style={styles.fileItem}>
              {file.name}
              <button
                style={styles.deleteIcon}
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                aria-label={`Supprimer ${file.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Cas par défaut: uploader
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={e => setFiles(multiple ? Array.from(e.target.files) : e.target.files[0])}
        style={styles.input}
      />
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

  const handleSubmit = () => {
    if (!fichierCompta || fichesCaisse.length === 0 || !mois || !annee) {
      alert('Merci de remplir tous les champs !');
      return;
    }
    console.log({ fichierCompta, fichesCaisse, mois, annee });
    // TODO: appeler la logique métier ici
    alert('Traitement lancé !');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
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
            options={['JANVIER','FEVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOUT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DECEMBRE']}
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

        <button onClick={handleSubmit} style={styles.button}>▶️ Lancer le traitement</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: 'fixed', top: 0, left: 0,
    width: '100vw', height: '100vh',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#e5e7eb', margin: 0, padding: 0, boxSizing: 'border-box'
  },
  container: {
    width: '90%', maxWidth: '600px',
    backgroundColor: '#fff', padding: '2rem',
    borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif', boxSizing: 'border-box'
  },
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#111827', fontSize: '1.75rem' },
  field: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
  fieldSmall: { flex: 1, display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '0.5rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' },
  select: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', appearance: 'none' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  uploaded: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#111827' },
  deleteIcon: { marginLeft: '0.5rem', background: 'none', border: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer' },
  fileList: { listStyleType: 'none', paddingLeft: 0, marginBottom: '0.5rem' },
  fileItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#374151', padding: '0.25rem 0' }
};

export default App;