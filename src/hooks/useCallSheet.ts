import { useCallback, useEffect } from 'react';
import { useCallSheet as useCallSheetContext } from '@/contexts/CallSheetContext';
import { useProductionInfoState } from './useProductionInfo';


// Hook for call sheet operations with autofill
export const useCallSheetEditor = () => {
  const { data, dispatch } = useCallSheetContext();
  const { productionInfo } = useProductionInfoState();

  // Autofill from production info
  const autofillFromProductionInfo = useCallback((productionInfo: any) => {
    dispatch({ type: 'AUTOFILL_PRODUCTION_INFO', productionInfo });
  }, [dispatch]);

  // Autofill from production info context when it changes
  useEffect(() => {
    if (productionInfo) {
      autofillFromProductionInfo(productionInfo);
    }
  }, [productionInfo, autofillFromProductionInfo]);

  // Field update functions
  const updateField = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', path: field, value });
  }, [dispatch]);

  const addRow = useCallback((table: 'scenes' | 'cast' | 'featureJunior' | 'advanceSchedule') => {
    dispatch({ type: 'ADD_ROW', table });
  }, [dispatch]);

  const removeRow = useCallback((table: 'scenes' | 'cast' | 'featureJunior' | 'advanceSchedule', index: number) => {
    dispatch({ type: 'REMOVE_ROW', table, index });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    data,
    updateField,
    addRow,
    removeRow,
    reset,
    autofillFromProductionInfo
  };
};

// Hook for call sheet state management
export const useCallSheetState = () => {
  const { data } = useCallSheetContext();

  return {
    data
  };
};

// Hook for call sheet actions
export const useCallSheetActions = () => {
  const { dispatch } = useCallSheetContext();

  const updateField = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', path: field, value });
  }, [dispatch]);

  const addRow = useCallback((table: 'scenes' | 'cast' | 'featureJunior' | 'advanceSchedule') => {
    dispatch({ type: 'ADD_ROW', table });
  }, [dispatch]);

  const removeRow = useCallback((table: 'scenes' | 'cast' | 'featureJunior' | 'advanceSchedule', index: number) => {
    dispatch({ type: 'REMOVE_ROW', table, index });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const autofillFromProductionInfo = useCallback((productionInfo: any) => {
    dispatch({ type: 'AUTOFILL_PRODUCTION_INFO', productionInfo });
  }, [dispatch]);

  return {
    updateField,
    addRow,
    removeRow,
    reset,
    autofillFromProductionInfo
  };
};
