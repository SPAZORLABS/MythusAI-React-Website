import { useCallback } from 'react';
import { useScenes } from '@/contexts/ScenesContext';

// Hook for scene operations (search, filter, sort, view mode)
export const useScenesOperations = () => {
  const { dispatch } = useScenes();

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  const toggleFilters = useCallback(() => {
    dispatch({ type: 'SET_SHOW_FILTERS', payload: true });
  }, [dispatch]);

  const setSceneTypeFilter = useCallback((type: 'all' | 'EXT' | 'INT') => {
    dispatch({ type: 'SET_SCENE_TYPE_FILTER', payload: type });
  }, [dispatch]);

  const setViewMode = useCallback((mode: 'list' | 'breakdown') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [dispatch]);

  const setSort = useCallback((sortBy: 'scene_number' | 'header' | 'body_length' | 'location', sortOrder: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  }, [dispatch]);

  return {
    setSearchQuery,
    toggleFilters,
    setSceneTypeFilter,
    setViewMode,
    setSort,
  };
};

// Hook for scene statistics
export const useScenesStats = () => {
  const { state } = useScenes();

  return {
    totalScenes: state.totalScenes,
    filteredScenesCount: state.scenes.length,
    loading: state.loading,
    error: state.error,
  };
};

// Hook for scene detail operations
export const useSceneDetail = () => {
  const { state, loadSceneDetail, closeDetailPanel, navigateScene } = useScenes();

  return {
    selectedScene: state.selectedScene,
    sceneContext: state.sceneContext,
    detailLoading: state.detailLoading,
    isDetailPanelOpen: state.showDetailPanel,
    loadSceneDetail,
    closeDetailPanel,
    navigateScene,
  };
};

// Hook for breakdown operations
export const useBreakdownOperations = () => {
  const { 
    state, 
    loadBreakdownsForScenes, 
    generateBreakdown, 
    updateBreakdown, 
    refreshBreakdown 
  } = useScenes();

  return {
    breakdowns: state.breakdowns,
    loadingBreakdowns: state.loadingBreakdowns,
    updatingBreakdowns: state.updatingBreakdowns,
    loadBreakdownsForScenes,
    generateBreakdown,
    updateBreakdown,
    refreshBreakdown,
  };
};

// Hook for summary operations
export const useSummaryOperations = () => {
  const { state, handleShowSummaryDetail, closeSummaryPanel } = useScenes();

  return {
    isSummaryPanelOpen: state.showSummaryPanel,
    summaryDetailData: state.summaryDetailData,
    handleShowSummaryDetail,
    closeSummaryPanel,
  };
};

// Hook for view mode operations
export const useViewMode = () => {
  const { state, handleViewModeChange } = useScenes();

  return {
    viewMode: state.viewMode,
    handleViewModeChange,
  };
};

// Hook for search and filter operations
export const useSearchAndFilter = () => {
  const { state, setSearchQuery, setSceneTypeFilter, toggleFilters } = useScenesOperations();

  return {
    searchQuery: state.searchQuery,
    sceneTypeFilter: state.sceneTypeFilter,
    showFilters: state.showFilters,
    setSearchQuery,
    setSceneTypeFilter,
    toggleFilters,
  };
};

// Hook for sort operations
export const useSort = () => {
  const { state, setSort } = useScenesOperations();

  return {
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    setSort,
  };
};