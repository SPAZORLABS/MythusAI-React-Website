import { useCallback, useState, useEffect } from 'react';
import { useDailyProductionReport as useDailyProductionReportContext } from '@/contexts/DailyProductionReportContext';
import { useProductionInfoState } from './useProductionInfo';
import { DailyProductionReportData, CharacterRow } from '@/types/dailyProductionReport';
import { scenesService } from '@/services/api/scenesService';
import { Screenplay } from '@/services/api/screenplayService';

// Hook for daily production report operations with autofill
export const useDailyProductionReportEditor = (selectedScreenplay?: Screenplay | null, selectedScene?: any) => {
  const { data, dispatch } = useDailyProductionReportContext();
  const { productionInfo } = useProductionInfoState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to extract character names from scene body
  const extractCharactersFromScene = useCallback((sceneBody: string): string[] => {
    if (!sceneBody) return [];
    
    // Common character name patterns in screenplays
    const characterPatterns = [
      // UPPERCASE character names (most common in screenplays)
      /^([A-Z][A-Z\s]+)$/gm,
      // Character names with (V.O.) or (O.S.) suffixes
      /^([A-Z][A-Z\s]+)\s*\([VO\.S]+\)$/gm,
      // Character names followed by dialogue
      /^([A-Z][A-Z\s]+)\s*\n/gm
    ];
    
    const characters = new Set<string>();
    
    characterPatterns.forEach(pattern => {
      const matches = sceneBody.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Clean up the character name
          const cleanName = match
            .replace(/\s*\([VO\.S]+\)/, '') // Remove (V.O.) or (O.S.)
            .replace(/\s*\n.*$/, '') // Remove everything after newline
            .trim();
          
          // Only include names that are likely character names (2+ chars, mostly uppercase)
          if (cleanName.length >= 2 && cleanName.match(/^[A-Z][A-Z\s]*$/)) {
            characters.add(cleanName);
          }
        });
      }
    });
    
    return Array.from(characters).slice(0, 10); // Limit to 10 characters max
  }, []);

  // Autofill from production info
  const autofillFromProductionInfo = useCallback(() => {
    if (productionInfo) {
      dispatch({ type: 'AUTOFILL_PRODUCTION_INFO', productionInfo });
    }
  }, [productionInfo, dispatch]);

  // Autofill from scene data
  const autofillFromSceneData = useCallback((sceneData: any) => {
    dispatch({ type: 'AUTOFILL_SCENE_DATA', sceneData });
  }, [dispatch]);

  // Autofill from production info context when it changes
  useEffect(() => {
    if (productionInfo) {
      dispatch({ type: 'AUTOFILL_PRODUCTION_INFO', productionInfo });
    }
  }, [productionInfo, dispatch]);

  // Auto-fill form data when a scene is selected
  useEffect(() => {
    const loadSceneData = async () => {
      if (selectedScene) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Auto-fill basic scene information
          dispatch({ type: 'AUTOFILL_SCENE_DATA', sceneData: selectedScene });

          // Load detailed scene information if we have a scene ID
          if (selectedScene.scene_id && selectedScreenplay) {
            const sceneDetail = await scenesService.getSceneDetail(selectedScreenplay.id, selectedScene.scene_id);
            
            if (sceneDetail.success && sceneDetail.data) {
              const sceneData = sceneDetail.data;
              
              // Auto-fill with detailed scene information
              dispatch({ type: 'AUTOFILL_SCENE_DATA', sceneData });

              // Extract characters from scene body
              const extractedCharacters = extractCharactersFromScene(sceneData.body);
              if (extractedCharacters.length > 0) {
                const characterRows = extractedCharacters.map(char => ({
                  character: char,
                  castName: '',
                  callTime: '',
                  reportTime: ''
                }));
                
                // Update characters in the context
                characterRows.forEach((char, index) => {
                  dispatch({ type: 'SET_FIELD', path: `characters[${index}].character`, value: char.character });
                });
              }
            }
          }

          // Auto-fill characters from scene context (if available)
          if (selectedScene.context?.characters) {
            const sceneCharacters = selectedScene.context.characters.map((char: any) => ({
              character: char.name || char.character || '',
              castName: char.cast_name || char.actor || '',
              callTime: char.call_time || '',
              reportTime: char.report_time || ''
            }));
            
            // Update characters in the context
            sceneCharacters.forEach((char: any, index: number) => {
              dispatch({ type: 'SET_FIELD', path: `characters[${index}].character`, value: char.character });
              dispatch({ type: 'SET_FIELD', path: `characters[${index}].castName`, value: char.castName });
              dispatch({ type: 'SET_FIELD', path: `characters[${index}].callTime`, value: char.callTime });
              dispatch({ type: 'SET_FIELD', path: `characters[${index}].reportTime`, value: char.reportTime });
            });
          }
        } catch (error) {
          console.error('Failed to load detailed scene data:', error);
          setError('Failed to load scene data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSceneData();
  }, [selectedScene, selectedScreenplay, dispatch, extractCharactersFromScene]);

  // Field update functions
  const updateField = useCallback((field: keyof DailyProductionReportData, value: any) => {
    dispatch({ type: 'SET_FIELD', path: field, value });
  }, [dispatch]);

  const updateCharacterField = useCallback((index: number, field: keyof CharacterRow, value: string) => {
    dispatch({ type: 'SET_FIELD', path: `characters[${index}].${field}`, value });
  }, [dispatch]);

  const addCharacter = useCallback(() => {
    dispatch({ type: 'ADD_CHARACTER' });
  }, [dispatch]);

  const removeCharacter = useCallback((index: number) => {
    if (data.characters.length > 1) {
      dispatch({ type: 'REMOVE_CHARACTER', index });
    }
  }, [data.characters.length, dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    data,
    isLoading,
    error,
    updateField,
    updateCharacterField,
    addCharacter,
    removeCharacter,
    reset,
    autofillFromProductionInfo,
    autofillFromSceneData
  };
};

// Hook for daily production report state management
export const useDailyProductionReportState = () => {
  const { data } = useDailyProductionReportContext();

  return {
    data
  };
};

// Hook for daily production report actions
export const useDailyProductionReportActions = () => {
  const { dispatch } = useDailyProductionReportContext();

  const updateField = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', path: field, value });
  }, [dispatch]);

  const addCharacter = useCallback(() => {
    dispatch({ type: 'ADD_CHARACTER' });
  }, [dispatch]);

  const removeCharacter = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_CHARACTER', index });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const loadData = useCallback((data: DailyProductionReportData) => {
    dispatch({ type: 'LOAD_DATA', data });
  }, [dispatch]);

  const autofillFromProductionInfo = useCallback((productionInfo: any) => {
    dispatch({ type: 'AUTOFILL_PRODUCTION_INFO', productionInfo });
  }, [dispatch]);

  return {
    updateField,
    addCharacter,
    removeCharacter,
    reset,
    loadData,
    autofillFromProductionInfo
  };
};

// Hook for daily production report formatting
export const useDailyProductionReportFormatter = () => {
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  }, []);

  const formatTime = useCallback((timeString: string): string => {
    if (!timeString) return '';
    return timeString;
  }, []);

  return {
    formatDate,
    formatTime
  };
};
