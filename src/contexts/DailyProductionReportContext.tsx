import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DailyProductionReportData, createEmptyDailyProductionReport } from '@/types/dailyProductionReport';

type DailyProductionReportAction = 
  | { type: 'SET_FIELD'; path: string; value: any }
  | { type: 'ADD_CHARACTER' }
  | { type: 'REMOVE_CHARACTER'; index: number }
  | { type: 'LOAD_DATA'; data: DailyProductionReportData }
  | { type: 'RESET' }
  | { type: 'AUTOFILL_PRODUCTION_INFO'; productionInfo: any }
  | { type: 'AUTOFILL_SCENE_DATA'; sceneData: any };

interface DailyProductionReportContextType {
  data: DailyProductionReportData;
  dispatch: React.Dispatch<DailyProductionReportAction>;
}

const DailyProductionReportContext = createContext<DailyProductionReportContextType | null>(null);

function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const idx = parseInt(index);
      if (!current[arrayKey]) current[arrayKey] = [];
      if (!current[arrayKey][idx]) current[arrayKey][idx] = {};
      current[arrayKey] = [...current[arrayKey]];
      current = current[arrayKey][idx] = { ...current[arrayKey][idx] };
    } else {
      current[key] = { ...current[key] };
      current = current[key];
    }
  }

  const lastKey = keys[keys.length - 1];
  const lastArrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
  
  if (lastArrayMatch) {
    const [, arrayKey, index] = lastArrayMatch;
    const idx = parseInt(index);
    if (!current[arrayKey]) current[arrayKey] = [];
    current[arrayKey] = [...current[arrayKey]];
    if (!current[arrayKey][idx]) current[arrayKey][idx] = {};
    current[arrayKey][idx] = { ...current[arrayKey][idx], ...value };
  } else {
    current[lastKey] = value;
  }

  return result;
}

function dailyProductionReportReducer(state: DailyProductionReportData, action: DailyProductionReportAction): DailyProductionReportData {
  switch (action.type) {
    case 'SET_FIELD':
      return setNestedValue(state, action.path, action.value);
      
    case 'ADD_CHARACTER':
      return {
        ...state,
        characters: [...state.characters, { character: '', castName: '', callTime: '', reportTime: '' }]
      };
      
    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter((_, index) => index !== action.index)
      };
      
    case 'LOAD_DATA':
      return action.data;
      
    case 'RESET':
      return createEmptyDailyProductionReport();
      
    case 'AUTOFILL_PRODUCTION_INFO':
      const productionInfo = action.productionInfo;
      return {
        ...state,
        // Map production info to daily report fields
        firstAD: productionInfo?.assistant_directors?.[0] || state.firstAD,
        productionHOD: productionInfo?.line_producer_name || productionInfo?.unit_production_manager || state.productionHOD,
        // Add more mappings as needed
        notes: productionInfo?.company_name ? `Production: ${productionInfo.company_name}` : state.notes,
      };
      
    case 'AUTOFILL_SCENE_DATA':
      const sceneData = action.sceneData;
      return {
        ...state,
        sceneNumber: sceneData?.scene_number || sceneData?.sceneNumber || state.sceneNumber,
        shootLocation: sceneData?.location || sceneData?.set_name || sceneData?.shootLocation || state.shootLocation,
        notes: sceneData?.est_minutes ? `Estimated ${sceneData.est_minutes} minutes` : state.notes,
      };
      
    default:
      return state;
  }
}

export function DailyProductionReportProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(dailyProductionReportReducer, createEmptyDailyProductionReport());

  return (
    <DailyProductionReportContext.Provider value={{ data, dispatch }}>
      {children}
    </DailyProductionReportContext.Provider>
  );
}

export function useDailyProductionReport() {
  const context = useContext(DailyProductionReportContext);
  if (!context) {
    throw new Error('useDailyProductionReport must be used within a DailyProductionReportProvider');
  }
  return context;
}
