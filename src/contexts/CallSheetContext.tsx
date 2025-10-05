import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CallSheetData, createEmptyCallSheet } from '@/types/callSheet';

type CallSheetAction = 
  | { type: 'SET_FIELD'; path: string; value: any }
  | { type: 'ADD_ROW'; table: 'scenes' | 'cast' | 'featureJunior' | 'advanceSchedule' }
  | { type: 'REMOVE_ROW'; table: 'scenes' | 'cast' | 'featureJunior' | 'advanceSchedule'; index: number }
  | { type: 'LOAD_DATA'; data: CallSheetData }
  | { type: 'RESET' }
  | { type: 'AUTOFILL_PRODUCTION_INFO'; productionInfo: any }
  | { type: 'AUTOFILL_SCENE_DETAILS'; sceneDetails: any }
  | { type: 'SET_SCENE_OPTIONS'; sceneOptions: any[] };

interface CallSheetContextType {
  data: CallSheetData;
  dispatch: React.Dispatch<CallSheetAction>;
}

const CallSheetContext = createContext<CallSheetContextType | null>(null);

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

function callSheetReducer(state: CallSheetData, action: CallSheetAction): CallSheetData {
  switch (action.type) {
    case 'SET_FIELD':
      return setNestedValue(state, action.path, action.value);
      
    case 'ADD_ROW':
      return {
        ...state,
        [action.table]: [...state[action.table], {}]
      };
      
    case 'REMOVE_ROW':
      return {
        ...state,
        [action.table]: state[action.table].filter((_, index) => index !== action.index)
      };
      
    case 'LOAD_DATA':
      return action.data;
      
    case 'RESET':
      return createEmptyCallSheet();
      
    case 'AUTOFILL_PRODUCTION_INFO':
      const productionInfo = action.productionInfo;
      return {
        ...state,
        // Map production info to call sheet fields
        productionHouseName: productionInfo?.company_name || state.productionHouseName,
        titleOfFilm: productionInfo?.title || state.titleOfFilm,
        productionHouseAddress: productionInfo?.company_address || state.productionHouseAddress,
        
        // Crew mapping
        director: productionInfo?.director_name || state.director,
        dop: productionInfo?.director_of_photography || state.dop,
        executiveProducer: productionInfo?.executive_producer || state.executiveProducer,
        lineProducer: productionInfo?.line_producer_name || state.lineProducer,
        productionAccountant: productionInfo?.production_accountant || state.productionAccountant,
        productionDesigner: productionInfo?.production_designer || state.productionDesigner,
        artDirector: productionInfo?.art_director || state.artDirector,
        assistantArtDirector: productionInfo?.assistant_art_director || state.assistantArtDirector,
        artTeam: productionInfo?.art_team || state.artTeam,
        onSetEditor: productionInfo?.on_set_editor || state.onSetEditor,
        gaffer: productionInfo?.gaffer || state.gaffer,
        wardrobe: productionInfo?.wardrobe_department || state.wardrobe,
        makeupHair: productionInfo?.makeup_hair_department || state.makeupHair,
        firstAC: productionInfo?.first_assistant_camera || state.firstAC,
        focusPuller1: productionInfo?.focus_puller_1 || state.focusPuller1,
        focusPuller2: productionInfo?.focus_puller_2 || state.focusPuller2,
        actionDirector: productionInfo?.action_director || state.actionDirector,
        directionDepartment: productionInfo?.direction_department || state.directionDepartment,
        productionTeam: productionInfo?.production_team || state.productionTeam,
      };
      
    case 'AUTOFILL_SCENE_DETAILS':
      const sceneDetails = action.sceneDetails;
      return {
        ...state,
        // Autofill scene details - using available CallSheet properties
        shootLocation: sceneDetails?.location || state.shootLocation,
        // Note: CallSheet doesn't have sceneNumber, intExt, dayNight, characters, synopsis properties
        // These would need to be added to CallSheetSchema if needed
      };
      
    case 'SET_SCENE_OPTIONS':
      return {
        ...state,
        // Note: CallSheet doesn't have sceneOptions property
        // This would need to be added to CallSheetSchema if needed
      };
      
    default:
      return state;
  }
}

export function CallSheetProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(callSheetReducer, createEmptyCallSheet());

  return (
    <CallSheetContext.Provider value={{ data, dispatch }}>
      {children}
    </CallSheetContext.Provider>
  );
}

export function useCallSheet() {
  const context = useContext(CallSheetContext);
  if (!context) {
    throw new Error('useCallSheet must be used within a CallSheetProvider');
  }
  return context;
}
