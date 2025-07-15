import React from 'react';
import styles from './SelectInput.module.css';

const SelectInput = ({ label, options, value, onChange }) => (
  <div className={styles.fieldSmall}>
    <label className={styles.label}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className={styles.select}>
      <option value="" disabled hidden>{label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default SelectInput;