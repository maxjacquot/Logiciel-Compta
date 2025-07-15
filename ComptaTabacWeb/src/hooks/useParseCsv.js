import { useCallback } from 'react';
import Papa from 'papaparse';

export const useParseCsv = () => {
  return useCallback(file => {
    return new Promise(resolve => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: results => resolve(results.data),
      });
    });
  }, []);
};