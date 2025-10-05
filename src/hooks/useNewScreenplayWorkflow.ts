import { useCallback } from 'react'
import { useNewScreenplay } from '@/contexts/NewScreenplayContext'
import { screenplayService } from '@/services/api/screenplayService'
import { productionService } from '@/services/api/production'
import { fileService } from '@/services/api/fileService'
import { ProductionInfo } from '@/types'

export const useNewScreenplayWorkflow = () => {
  const { state, dispatch } = useNewScreenplay()

  const setTitle = useCallback((title: string) => {
    dispatch({ type: 'SET_TITLE', payload: title })
    dispatch({ type: 'SET_ERROR', payload: { field: 'title', message: null } })
  }, [dispatch])

  const createScreenplayWithProductionInfo = useCallback(async (productionInfo: ProductionInfo) => {
    if (!state.screenplayId) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'productionInfo', message: 'No screenplay found. Please create screenplay first.' } })
      return false
    }

    dispatch({ type: 'SET_CREATING_SCREENPLAY', payload: true })
    dispatch({ type: 'SET_ERROR', payload: { field: 'productionInfo', message: null } })
    dispatch({ type: 'SET_SUCCESS', payload: { field: 'productionInfo', message: null } })

    try {
      const productionInfoWithTitle = {
        ...productionInfo,
        title: state.title.trim()
      }

      const productionResponse = await productionService.createProductionInfo(state.screenplayId, productionInfoWithTitle)
      
      if (productionResponse.success && productionResponse.data) {
        dispatch({ type: 'SET_PRODUCTION_INFO', payload: productionResponse.data })
        dispatch({ type: 'SET_SUCCESS', payload: { field: 'productionInfo', message: 'Production information saved successfully!' } })
        
        dispatch({ type: 'SET_CURRENT_STEP', payload: 3 })
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'upload' })
        
        return true
      } else {
        dispatch({ type: 'SET_PRODUCTION_INFO', payload: productionInfoWithTitle })
        dispatch({ type: 'SET_SUCCESS', payload: { field: 'productionInfo', message: 'Production info saved locally. Will sync when possible.' } })
        
        dispatch({ type: 'SET_CURRENT_STEP', payload: 3 })
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'upload' })
        
        return true
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'productionInfo', message: err.message || 'Failed to save production information' } })
      return false
    } finally {
      dispatch({ type: 'SET_CREATING_SCREENPLAY', payload: false })
    }
  }, [state.screenplayId, state.title, dispatch])

  const selectFile = useCallback((filename: string | null) => {
    dispatch({ type: 'SET_SELECTED_FILE', payload: filename })
    dispatch({ type: 'SET_ERROR', payload: { field: 'fileProcessing', message: null } })
    dispatch({ type: 'SET_SUCCESS', payload: { field: 'fileProcessing', message: null } })
  }, [dispatch])

  const processFile = useCallback(async () => {
    if (!state.selectedFile) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'fileProcessing', message: 'Please select a file first' } })
      return false
    }

    if (!state.screenplayId) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'fileProcessing', message: 'No screenplay ID found' } })
      return false
    }

    dispatch({ type: 'SET_PROCESSING_FILE', payload: true })
    dispatch({ type: 'SET_PROCESSING_STEP', payload: 'Processing PDF file...' })
    dispatch({ type: 'SET_ERROR', payload: { field: 'fileProcessing', message: null } })
    dispatch({ type: 'SET_SUCCESS', payload: { field: 'fileProcessing', message: null } })

    try {
      const response = await fileService.processFileToScript(state.screenplayId, state.selectedFile)
      
      if (response.screenplay_id) {
        dispatch({ type: 'SET_PROCESSING_STEP', payload: 'Extracting scenes...' })
        
        // Transfer production info to the new screenplay if it exists
        if (state.productionInfo.company_name || state.productionInfo.director_name) {
          try {
            await productionService.createProductionInfo(response.screenplay_id, state.productionInfo)
            dispatch({ type: 'SET_SUCCESS', payload: { field: 'fileProcessing', message: 'File processed successfully! Production info transferred.' } })
          } catch (err) {
            console.warn('Failed to transfer production info:', err)
            dispatch({ type: 'SET_SUCCESS', payload: { field: 'fileProcessing', message: 'File processed successfully! Please add production info manually.' } })
          }
        } else {
          dispatch({ type: 'SET_SUCCESS', payload: { field: 'fileProcessing', message: 'File processed successfully!' } })
        }
        
        dispatch({ type: 'SET_SCREENPLAY_ID', payload: response.screenplay_id })
        dispatch({ type: 'SET_CURRENT_STEP', payload: 4 })
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'scenes' })
        
        return true
      } else {
        throw new Error('No screenplay ID received from processing')
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'fileProcessing', message: err.message || 'Failed to process file' } })
      return false
    } finally {
      dispatch({ type: 'SET_PROCESSING_FILE', payload: false })
      dispatch({ type: 'SET_PROCESSING_STEP', payload: '' })
    }
  }, [state.selectedFile, state.screenplayId, state.productionInfo, dispatch])

  const startManualSceneCreation = useCallback(() => {
    if (!state.screenplayId) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'fileProcessing', message: 'No screenplay found. Please create screenplay first.' } })
      return
    }
    
    dispatch({ type: 'SET_CURRENT_STEP', payload: 4 })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'scenes' })
  }, [state.screenplayId, dispatch])

  // Complete setup
  const completeSetup = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 })
    dispatch({ type: 'SET_SHOW_SUCCESS', payload: true })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'complete' })
  }, [dispatch])

  const resetWorkflow = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [dispatch])

  const goToStep = useCallback((step: number, tab: string) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  }, [dispatch])

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  }, [dispatch])

  return {
    state,
    setTitle,
    createScreenplayWithProductionInfo,
    selectFile,
    processFile,
    startManualSceneCreation,
    completeSetup,
    resetWorkflow,
    goToStep,
    setActiveTab,
    dispatch, // Export dispatch for direct state updates
    
    // Computed values
    canProceedToUpload: !!state.screenplayId && !!state.title && (state.productionInfo.company_name || state.productionInfo.director_name),
    hasValidTitle: !!state.title.trim(),
    hasProductionInfo: !!(state.productionInfo.company_name || state.productionInfo.director_name),
    isReady: !!state.screenplayId && !!state.title
  }
}