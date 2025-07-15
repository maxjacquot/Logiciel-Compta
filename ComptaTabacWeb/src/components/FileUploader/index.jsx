import React from 'react';
import styles from './FileUploader.module.css';

const FileUploader = ({ label, accept, multiple = false, files, setFiles }) => {
  if (!multiple) {
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        {files ? (
          <div className={styles.uploadedSingle}>
            <span className={styles.uploadedText}>{files.name}</span>
            <button
              className={styles.deleteIcon}
              onClick={() => setFiles(null)}
              aria-label="Supprimer fichier"
            >×</button>
          </div>
        ) : (
          <label className={styles.fileButton}>
            Sélectionner un fichier
            <input
              type="file"
              accept={accept}
              multiple={false}
              onChange={e => setFiles(e.target.files[0])}
              className={styles.hiddenInput}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <label className={styles.fileButton}>
        Sélectionner plusieurs fichiers
        <input
          type="file"
          accept={accept}
          multiple
          onChange={e => setFiles(Array.from(e.target.files))}
          className={styles.hiddenInput}
        />
      </label>
    </div>
  );
};

export default FileUploader;