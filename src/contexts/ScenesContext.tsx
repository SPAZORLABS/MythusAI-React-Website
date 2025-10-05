import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { scenesService, Scene, SceneDetail } from '@/services/api/scenesService';
import { masterBreakdownService, MasterBreakdownResponse } from '@/services/api/masterBreakdownService';

// Types
export interface ScenesState {
  // Scenes data
  scenes: Scene[];
  selectedScene: SceneDetail | null;
  sceneContext: any;
  
  // Loading states
  loading: boolean;
  detailLoading: boolean;
  breakdownLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Total scenes count
  totalScenes: number;
  
  // Filters and search
  searchQuery: string;
  sceneTypeFilter: 'all' | 'EXT' | 'INT';
  showFilters: boolean;
  
  // Sort
  sortBy: 'scene_number' | 'header' | 'body_length' | 'location';
  sortOrder: 'asc' | 'desc';
  
  // View mode
  viewMode: 'list' | 'breakdown';
  
  // Breakdown data
  breakdowns: Map<string, MasterBreakdownResponse>;
  loadingBreakdowns: Set<string>;
  updatingBreakdowns: Set<string>;
  
  // UI state
  showDetailPanel: boolean;
  showSummaryPanel: boolean;
  summaryDetailData: any;
}

// Action types
type ScenesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DETAIL_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCENES'; payload: Scene[] }
  | { type: 'UPDATE_SCENE'; payload: SceneDetail }
  | { type: 'SET_SELECTED_SCENE'; payload: SceneDetail | null }
  | { type: 'SET_SCENE_CONTEXT'; payload: any }
  | { type: 'SET_TOTAL_SCENES'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SCENE_TYPE_FILTER'; payload: 'all' | 'EXT' | 'INT' }
  | { type: 'SET_SHOW_FILTERS'; payload: boolean }
  | { type: 'SET_SORT'; payload: { sortBy: 'scene_number' | 'header' | 'body_length' | 'location'; sortOrder: 'asc' | 'desc' } }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'breakdown' }
  | { type: 'SET_BREAKDOWNS'; payload: Map<string, MasterBreakdownResponse> }
  | { type: 'SET_LOADING_BREAKDOWNS'; payload: Set<string> }
  | { type: 'SET_UPDATING_BREAKDOWNS'; payload: Set<string> }
  | { type: 'SET_SHOW_DETAIL_PANEL'; payload: boolean }
  | { type: 'SET_SHOW_SUMMARY_PANEL'; payload: boolean }
  | { type: 'SET_SUMMARY_DETAIL_DATA'; payload: any }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: ScenesState = {
  scenes: [],
  selectedScene: null,
  sceneContext: null,
  loading: false,
  detailLoading: false,
  breakdownLoading: false,
  error: null,
  totalScenes: 0,
  searchQuery: '',
  sceneTypeFilter: 'all',
  showFilters: false,
  sortBy: 'scene_number',
  sortOrder: 'asc',
  viewMode: 'list',
  breakdowns: new Map(),
  loadingBreakdowns: new Set(),
  updatingBreakdowns: new Set(),
  showDetailPanel: false,
  showSummaryPanel: false,
  summaryDetailData: null,
};

// Reducer
function scenesReducer(state: ScenesState, action: ScenesAction): ScenesState {
  switch (action.type) {
    case 'UPDATE_SCENE':
      return {
        ...state,
        scenes: state.scenes.map(scene => 
          scene.scene_id === action.payload.scene_id 
            ? { ...scene, ...action.payload }
            : scene
        )
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DETAIL_LOADING':
      return { ...state, detailLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SCENES':
      return { ...state, scenes: action.payload };
    case 'SET_SELECTED_SCENE':
      return { ...state, selectedScene: action.payload };
    case 'SET_SCENE_CONTEXT':
      return { ...state, sceneContext: action.payload };
    case 'SET_TOTAL_SCENES':
      return { ...state, totalScenes: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SCENE_TYPE_FILTER':
      return { ...state, sceneTypeFilter: action.payload };
    case 'SET_SHOW_FILTERS':
      return { ...state, showFilters: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_BREAKDOWNS':
      return { ...state, breakdowns: action.payload };
    case 'SET_LOADING_BREAKDOWNS':
      return { ...state, loadingBreakdowns: action.payload };
    case 'SET_UPDATING_BREAKDOWNS':
      return { ...state, updatingBreakdowns: action.payload };
    case 'SET_SHOW_DETAIL_PANEL':
      return { ...state, showDetailPanel: action.payload };
    case 'SET_SHOW_SUMMARY_PANEL':
      return { ...state, showSummaryPanel: action.payload };
    case 'SET_SUMMARY_DETAIL_DATA':
      return { ...state, summaryDetailData: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface ScenesContextType {
  state: ScenesState;
  dispatch: React.Dispatch<ScenesAction>;
  // Actions
  loadScenes: () => Promise<void>;
  loadSceneDetail: (sceneId: string) => Promise<void>;
  fetchSceneDetail: (sceneId: string) => Promise<SceneDetail | null>;
  fetchSceneElements: (sceneNumber: string) => Promise<MasterBreakdownResponse | null>;
  closeDetailPanel: () => void;
  navigateScene: (direction: 'prev' | 'next') => Promise<void>;
  handleViewModeChange: (mode: 'list' | 'breakdown') => void;
  handleSortChange: (sortBy: typeof initialState.sortBy, sortOrder: typeof initialState.sortOrder) => void;
  handleSceneAdded: () => void;
  loadBreakdownsForScenes: (sceneNumbers: string[]) => Promise<void>;
  generateBreakdown: (sceneNumber: string) => Promise<void>;
  updateBreakdown: (sceneNumber: string, breakdown: MasterBreakdownResponse['scene_elements']) => Promise<void>;
  refreshBreakdown: (sceneNumber: string) => Promise<void>;
  handleShowSummaryDetail: (summaryData: any) => void;
  closeSummaryPanel: () => void;
  // Computed values
  filteredScenes: Scene[];
  sortedScenes: Scene[];
}

const ScenesContext = createContext<ScenesContextType | undefined>(undefined);

// Provider component
interface ScenesProviderProps {
  children: ReactNode;
  screenplayId: string;
}

export const ScenesProvider: React.FC<ScenesProviderProps> = ({ children, screenplayId }) => {
  const [state, dispatch] = useReducer(scenesReducer, initialState);

  const loadScenes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await scenesService.getScenesSummary(screenplayId, 1, 1000, 120);
      dispatch({ type: 'SET_SCENES', payload: response.scenes });
      dispatch({ type: 'SET_TOTAL_SCENES', payload: response.total_scenes });
    } catch (err: any) {
      console.error('Error loading scenes:', err); // Debug log
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to load scenes' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [screenplayId]);

  useEffect(() => {
    if (screenplayId) {
      loadScenes();
    }
  }, [screenplayId, loadScenes]);

  const loadSceneDetail = useCallback(async (sceneId: string) => {
    dispatch({ type: 'SET_DETAIL_LOADING', payload: true });
    dispatch({ type: 'SET_SELECTED_SCENE', payload: null });
    dispatch({ type: 'SET_SHOW_DETAIL_PANEL', payload: true });

    try {
      const response = await scenesService.getSceneDetail(screenplayId, sceneId);

      const sceneDetail: SceneDetail = {
        scene_id: sceneId,
        scene_number: response.data.scene_number,
        header: response.data.header,
        body: response.data.body,
        created_at: new Date().toISOString(),
        word_count: response.data.body.split(' ').length,
        character_count: response.data.body.length,
        int_ext: response.data.int_ext,
        day_night: response.data.day_night,
        set_name: response.data.set_name,
        page_num: response.data.page_num,
        page_eighths: response.data.page_eighths,
        synopsis: response.data.synopsis,
        script_day: response.data.script_day,
        sequence: response.data.sequence,
        est_minutes: response.data.est_minutes,
        comment: response.data.comment,
        location: response.data.location,
      };

      dispatch({ type: 'SET_SELECTED_SCENE', payload: sceneDetail });
      dispatch({ type: 'SET_SCENE_CONTEXT', payload: response.data.context });
      dispatch({ type: 'SET_SHOW_SUMMARY_PANEL', payload: false });
      dispatch({ type: 'SET_SUMMARY_DETAIL_DATA', payload: null });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load scene details' });
    } finally {
      dispatch({ type: 'SET_DETAIL_LOADING', payload: false });
    }
  }, [screenplayId]);

  // Fetch scene detail without changing UI state (for external consumers like Call Sheet)
  const fetchSceneDetail = useCallback(async (sceneId: string): Promise<SceneDetail | null> => {
    try {
      const response = await scenesService.getSceneDetail(screenplayId, sceneId);
      const sceneDetail: SceneDetail = {
        scene_id: sceneId,
        scene_number: response.data.scene_number,
        header: response.data.header,
        body: response.data.body,
        created_at: new Date().toISOString(),
        word_count: response.data.body.split(' ').length,
        character_count: response.data.body.length,
        int_ext: response.data.int_ext,
        day_night: response.data.day_night,
        set_name: response.data.set_name,
        page_num: response.data.page_num,
        page_eighths: response.data.page_eighths,
        synopsis: response.data.synopsis,
        script_day: response.data.script_day,
        sequence: response.data.sequence,
        est_minutes: response.data.est_minutes,
        comment: response.data.comment,
        location: response.data.location,
      };
      return sceneDetail;
    } catch (err) {
      console.warn('fetchSceneDetail failed:', err);
      return null;
    }
  }, [screenplayId]);

  // Fetch scene breakdown elements without changing UI state
  const fetchSceneElements = useCallback(async (sceneNumber: string): Promise<MasterBreakdownResponse | null> => {
    try {
      const breakdown = await masterBreakdownService.getSceneBreakdown(screenplayId, sceneNumber);
      return breakdown ?? null;
    } catch (err) {
      console.warn('fetchSceneElements failed:', err);
      return null;
    }
  }, [screenplayId]);

  const closeDetailPanel = useCallback(() => {
    dispatch({ type: 'SET_SHOW_DETAIL_PANEL', payload: false });
    dispatch({ type: 'SET_SELECTED_SCENE', payload: null });
    dispatch({ type: 'SET_SCENE_CONTEXT', payload: null });
  }, []);

  const navigateScene = useCallback(async (direction: 'prev' | 'next') => {
    if (!state.sceneContext) return;

    const targetScene = direction === 'prev' ? state.sceneContext.previous_scene : state.sceneContext.next_scene;
    if (targetScene) {
      await loadSceneDetail(targetScene.scene_id);
    }
  }, [state.sceneContext, loadSceneDetail]);

  const handleViewModeChange = useCallback((mode: 'list' | 'breakdown') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });

    if (mode === 'breakdown') {
      dispatch({ type: 'SET_SHOW_DETAIL_PANEL', payload: false });
      dispatch({ type: 'SET_SELECTED_SCENE', payload: null });
      dispatch({ type: 'SET_SCENE_CONTEXT', payload: null });

      if (state.scenes.length > 0) {
        loadBreakdownsForScenes(state.scenes.map(scene => scene.scene_number));
      }
    }
  }, [state.scenes]);

  const handleSortChange = useCallback((sortBy: typeof initialState.sortBy, sortOrder: typeof initialState.sortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  }, []);

  const handleSceneAdded = useCallback(() => {
    loadScenes();
  }, [loadScenes]);

  const loadBreakdownsForScenes = useCallback(async (sceneNumbers: string[]) => {
    const newLoadingSet = new Set(state.loadingBreakdowns);
    const scenesToLoad = sceneNumbers.filter(num => !state.breakdowns.has(num) && !newLoadingSet.has(num));

    if (scenesToLoad.length === 0) return;

    scenesToLoad.forEach(num => newLoadingSet.add(num));
    dispatch({ type: 'SET_LOADING_BREAKDOWNS', payload: newLoadingSet });

    try {
      const keysValuesResponse = await masterBreakdownService.listElementKeysValues(screenplayId);

      if (keysValuesResponse.success) {
        const newBreakdowns = new Map(state.breakdowns);

        for (const sceneNumber of scenesToLoad) {
          try {
            const existingBreakdown = await masterBreakdownService.getSceneBreakdown(screenplayId, sceneNumber);

            if (existingBreakdown.success && existingBreakdown.has_breakdown) {
              newBreakdowns.set(sceneNumber, existingBreakdown);
            } else {
              const sceneElements = keysValuesResponse.data.map(item => ({
                key: item.key,
                values: [],
                available_values: item.available_values,
              }));

              newBreakdowns.set(sceneNumber, {
                success: true,
                scene_id: sceneNumber,
                scene_elements: sceneElements,
                has_breakdown: false,
              });
            }
          } catch (sceneErr) {
            const sceneElements = keysValuesResponse.data.map(item => ({
              key: item.key,
              values: [],
              available_values: item.available_values,
            }));

            newBreakdowns.set(sceneNumber, {
              success: true,
              scene_id: sceneNumber,
              scene_elements: sceneElements,
              has_breakdown: false,
            });
          }
        }

        dispatch({ type: 'SET_BREAKDOWNS', payload: newBreakdowns });
      }
    } catch (err) {
      console.error('Failed to load breakdowns:', err);
    } finally {
      const updatedLoadingSet = new Set(newLoadingSet);
      scenesToLoad.forEach(num => updatedLoadingSet.delete(num));
      dispatch({ type: 'SET_LOADING_BREAKDOWNS', payload: updatedLoadingSet });
    }
  }, [screenplayId, state.loadingBreakdowns, state.breakdowns]);

  const generateBreakdown = useCallback(async (sceneNumber: string) => {
    const newLoadingSet = new Set(state.loadingBreakdowns);
    newLoadingSet.add(sceneNumber);
    dispatch({ type: 'SET_LOADING_BREAKDOWNS', payload: newLoadingSet });

    try {
      const result = await masterBreakdownService.autoExtractForScene(screenplayId, sceneNumber, false);

      if (result.success) {
        const keysValuesResponse = await masterBreakdownService.listElementKeysValues(screenplayId);

        if (keysValuesResponse.success) {
          const sceneElements = keysValuesResponse.data.map(item => {
            const proposedValues = result.proposed[item.key] || [];
            return {
              key: item.key,
              values: proposedValues,
              available_values: item.available_values,
            };
          });

          const newBreakdown = {
            success: true,
            scene_id: result.scene_id,
            scene_elements: sceneElements,
            has_breakdown: true,
          };

          const newBreakdowns = new Map(state.breakdowns);
          newBreakdowns.set(sceneNumber, newBreakdown);
          dispatch({ type: 'SET_BREAKDOWNS', payload: newBreakdowns });
        }
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to generate breakdown for scene ${sceneNumber}: ${err.message}` });
    } finally {
      const updatedLoadingSet = new Set(state.loadingBreakdowns);
      updatedLoadingSet.delete(sceneNumber);
      dispatch({ type: 'SET_LOADING_BREAKDOWNS', payload: updatedLoadingSet });
    }
  }, [screenplayId, state.loadingBreakdowns, state.breakdowns]);

  const updateBreakdown = useCallback(async (sceneNumber: string, breakdown: MasterBreakdownResponse['scene_elements']) => {
    const newUpdatingSet = new Set(state.updatingBreakdowns);
    newUpdatingSet.add(sceneNumber);
    dispatch({ type: 'SET_UPDATING_BREAKDOWNS', payload: newUpdatingSet });

    try {
      const newBreakdowns = new Map(state.breakdowns);
      const existingBreakdown = newBreakdowns.get(sceneNumber);
      if (existingBreakdown) {
        newBreakdowns.set(sceneNumber, {
          ...existingBreakdown,
          scene_elements: breakdown,
        });
        dispatch({ type: 'SET_BREAKDOWNS', payload: newBreakdowns });
      }

      const elementsToMerge: Record<string, any> = {};
      breakdown.forEach(element => {
        if (element.values && element.values.length > 0) {
          const validValues = element.values.filter(val => val !== null && val !== undefined);
          if (validValues.length > 0) {
            elementsToMerge[element.key] = validValues;
          }
        }
      });

      if (Object.keys(elementsToMerge).length > 0) {
        await masterBreakdownService.mergeSceneElements(screenplayId, sceneNumber, elementsToMerge);
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to update breakdown for scene ${sceneNumber}: ${err.message}` });
      loadBreakdownsForScenes([sceneNumber]);
    } finally {
      const updatedUpdatingSet = new Set(state.updatingBreakdowns);
      updatedUpdatingSet.delete(sceneNumber);
      dispatch({ type: 'SET_UPDATING_BREAKDOWNS', payload: updatedUpdatingSet });
    }
  }, [screenplayId, state.updatingBreakdowns, state.breakdowns, loadBreakdownsForScenes]);

  const refreshBreakdown = useCallback(async (sceneNumber: string) => {
    const newLoadingSet = new Set(state.loadingBreakdowns);
    newLoadingSet.add(sceneNumber);
    dispatch({ type: 'SET_LOADING_BREAKDOWNS', payload: newLoadingSet });

    try {
      const existingBreakdown = await masterBreakdownService.getSceneBreakdown(screenplayId, sceneNumber);

      if (existingBreakdown.success) {
        const newBreakdowns = new Map(state.breakdowns);
        newBreakdowns.set(sceneNumber, existingBreakdown);
        dispatch({ type: 'SET_BREAKDOWNS', payload: newBreakdowns });
      }
    } catch (err: any) {
      console.warn(`Failed to refresh breakdown for scene ${sceneNumber}:`, err);
    } finally {
      const updatedLoadingSet = new Set(state.loadingBreakdowns);
      updatedLoadingSet.delete(sceneNumber);
      dispatch({ type: 'SET_LOADING_BREAKDOWNS', payload: updatedLoadingSet });
    }
  }, [screenplayId, state.loadingBreakdowns, state.breakdowns]);

  const handleShowSummaryDetail = useCallback((summaryData: any) => {
    dispatch({ type: 'SET_SHOW_DETAIL_PANEL', payload: false });
    dispatch({ type: 'SET_SELECTED_SCENE', payload: null });
    dispatch({ type: 'SET_SCENE_CONTEXT', payload: null });
    dispatch({ type: 'SET_SHOW_SUMMARY_PANEL', payload: true });
    dispatch({ type: 'SET_SUMMARY_DETAIL_DATA', payload: summaryData });
  }, []);

  const closeSummaryPanel = useCallback(() => {
    dispatch({ type: 'SET_SHOW_SUMMARY_PANEL', payload: false });
    dispatch({ type: 'SET_SUMMARY_DETAIL_DATA', payload: null });
  }, []);

  // Computed values with memoization
  const filteredScenes = useMemo(() => {
    return state.scenes.filter(scene => {
      const matchesSearch = String(scene.header || "").toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                           String(scene.body_preview || "").toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesType = state.sceneTypeFilter === 'all' || 
                         scenesService.getSceneType(scene.header) === state.sceneTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [state.scenes, state.searchQuery, state.sceneTypeFilter]);

  const sortedScenes = useMemo(() => {
    return [...filteredScenes].sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (state.sortBy) {
        case 'scene_number':
          compareA = parseInt(a.scene_number, 10) || 0;
          compareB = parseInt(b.scene_number, 10) || 0;
          break;
        case 'header':
          compareA = String(a.header || "").toLowerCase();
          compareB = String(b.header || "").toLowerCase();
          break;
        case 'body_length':
          compareA = String(a.body_preview || "").length;
          compareB = String(b.body_preview || "").length;
          break;
        case 'location':
          compareA = String(scenesService.getSceneLocation(a.header)).toLowerCase();
          compareB = String(scenesService.getSceneLocation(b.header)).toLowerCase();
          break;
        default:
          compareA = a.scene_number;
          compareB = b.scene_number;
      }

      if (compareA < compareB) return state.sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredScenes, state.sortBy, state.sortOrder]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    loadScenes,
    loadSceneDetail,
    fetchSceneDetail,
    fetchSceneElements,
    closeDetailPanel,
    navigateScene,
    handleViewModeChange,
    handleSortChange,
    handleSceneAdded,
    loadBreakdownsForScenes,
    generateBreakdown,
    updateBreakdown,
    refreshBreakdown,
    handleShowSummaryDetail,
    closeSummaryPanel,
    filteredScenes,
    sortedScenes,
  }), [
    state,
    loadScenes,
    loadSceneDetail,
    closeDetailPanel,
    navigateScene,
    handleViewModeChange,
    handleSortChange,
    handleSceneAdded,
    loadBreakdownsForScenes,
    generateBreakdown,
    updateBreakdown,
    refreshBreakdown,
    handleShowSummaryDetail,
    closeSummaryPanel,
    filteredScenes,
    sortedScenes,
  ]);

  return (
    <ScenesContext.Provider value={contextValue}>
      {children}
    </ScenesContext.Provider>
  );
};

// Custom hook to use the context
export const useScenes = (): ScenesContextType => {
  const context = useContext(ScenesContext);
  if (context === undefined) {
    throw new Error('useScenes must be used within a ScenesProvider');
  }
  return context;
};

export default ScenesContext;