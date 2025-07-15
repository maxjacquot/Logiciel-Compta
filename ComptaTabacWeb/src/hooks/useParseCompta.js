import { useCallback } from 'react';
import * as XLSX from 'xlsx';

export const useParseCompta = () => {
  return useCallback(async file => {
    const data = await file.arrayBuffer();
    return XLSX.read(data, { type: 'array' });
  }, []);
};