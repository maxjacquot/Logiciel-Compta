export const MONTHS = [
  'JANVIER','FEVRIER','MARS','AVRIL','MAI','JUIN',
  'JUILLET','AOUT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DECEMBRE'
];

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
};