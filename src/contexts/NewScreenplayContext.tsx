import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { ProductionInfo, Scene } from '@/types'

// Types
export interface NewScreenplayState {
  // Core screenplay data
  screenplayId: string | null
  title: string
  productionInfo: ProductionInfo
  scenes: Scene[]
  
  // Workflow state
  currentStep: number
  activeTab: string
  
  // Processing state
  isCreatingScreenplay: boolean
  isProcessingFile: boolean
  processingStep: string
  
  // File handling
  selectedFile: string | null
  
  // UI state
  showSuccess: boolean
  
  // Error and success states
  errors: {
    title?: string
    productionInfo?: string
    fileProcessing?: string
  }
  
  success: {
    title?: string
    productionInfo?: string
    fileProcessing?: string
  }
}

// Action types
export type NewScreenplayAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_PRODUCTION_INFO'; payload: ProductionInfo }
  | { type: 'SET_SCREENPLAY_ID'; payload: string }
  | { type: 'SET_SCENES'; payload: Scene[] }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_FILE'; payload: string | null }
  | { type: 'SET_CREATING_SCREENPLAY'; payload: boolean }
  | { type: 'SET_PROCESSING_FILE'; payload: boolean }
  | { type: 'SET_PROCESSING_STEP'; payload: string }
  | { type: 'SET_SHOW_SUCCESS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: keyof NewScreenplayState['errors']; message: string | null } }
  | { type: 'SET_SUCCESS'; payload: { field: keyof NewScreenplayState['success']; message: string | null } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_SUCCESS' }
  | { type: 'RESET_STATE' }

// Initial state
const initialState: NewScreenplayState = {
  screenplayId: null,
  title: '',
  productionInfo: {
    company_name: '',
    production_number: '',
    director_name: '',
    producer_names: [],
    writer_names: [],
    line_producer_name: '',
    unit_production_manager: '',
    assistant_directors: [],
    shoot_start_date: '',
    shoot_end_date: '',
    genre: '',
    production_status: ''
  },
  scenes: [],
  currentStep: 1,
  activeTab: 'title-production',
  isCreatingScreenplay: false,
  isProcessingFile: false,
  processingStep: '',
  selectedFile: null,
  showSuccess: false,
  errors: {},
  success: {}
}

// Reducer
function newScreenplayReducer(state: NewScreenplayState, action: NewScreenplayAction): NewScreenplayState {
  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        title: action.payload,
        productionInfo: {
          ...state.productionInfo,
          title: action.payload
        }
      }
    
    case 'SET_PRODUCTION_INFO':
      return {
        ...state,
        productionInfo: {
          ...action.payload,
          title: state.title // Ensure title consistency
        }
      }
    
    case 'SET_SCREENPLAY_ID':
      return { ...state, screenplayId: action.payload }
    
    case 'SET_SCENES':
      return { ...state, scenes: action.payload }
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload }
    
    case 'SET_CREATING_SCREENPLAY':
      return { ...state, isCreatingScreenplay: action.payload }
    
    case 'SET_PROCESSING_FILE':
      return { ...state, isProcessingFile: action.payload }
    
    case 'SET_PROCESSING_STEP':
      return { ...state, processingStep: action.payload }
    
    case 'SET_SHOW_SUCCESS':
      return { ...state, showSuccess: action.payload }
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      }
    
    case 'SET_SUCCESS':
      return {
        ...state,
        success: {
          ...state.success,
          [action.payload.field]: action.payload.message
        }
      }
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} }
    
    case 'CLEAR_SUCCESS':
      return { ...state, success: {} }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Context
interface NewScreenplayContextType {
  state: NewScreenplayState
  dispatch: React.Dispatch<NewScreenplayAction>
}

const NewScreenplayContext = createContext<NewScreenplayContextType | undefined>(undefined)

// Provider
interface NewScreenplayProviderProps {
  children: ReactNode
}

export const NewScreenplayProvider: React.FC<NewScreenplayProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(newScreenplayReducer, initialState)

  return (
    <NewScreenplayContext.Provider value={{ state, dispatch }}>
      {children}
    </NewScreenplayContext.Provider>
  )
}

// Hook
export const useNewScreenplay = () => {
  const context = useContext(NewScreenplayContext)
  if (context === undefined) {
    throw new Error('useNewScreenplay must be used within a NewScreenplayProvider')
  }
  return context
}