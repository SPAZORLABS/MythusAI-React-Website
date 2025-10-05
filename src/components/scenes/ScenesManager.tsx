import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScenesProvider } from '@/contexts/ScenesContext';
import { useScenes } from '@/contexts/ScenesContextBase';
import { useScenesOperations, useScenesStats } from '@/hooks/useScenesOperations';
import PageHeader from '@/components/layout/PageHeader';
import ScenesContent from './ScenesContent';
import SceneDetailPanel from './SceneDetailPanel';
import SummarySidePanel from './SummarySidePanel';

interface ScenesManagerProps {
  screenplayId: string;
  screenplayTitle?: string;
  onSceneSelect?: (scene: any) => void;
  onFileManagerOpen?: () => void;
  onToggleSidebar?: () => void;
}

// Inner component that uses the context
const ScenesManagerInner: React.FC<ScenesManagerProps> = memo(({
  screenplayId,
  screenplayTitle = 'Screenplay',
  onSceneSelect,
  onFileManagerOpen,
  onToggleSidebar
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    state, 
    sortedScenes, 
    loadScenes, 
    loadSceneDetail, 
    closeDetailPanel, 
    navigateScene, 
    closeSummaryPanel, 
    handleViewModeChange, 
    handleSortChange, 
    handleSceneAdded, 
    loadBreakdownsForScenes, 
    generateBreakdown, 
    updateBreakdown, 
    refreshBreakdown, 
    handleShowSummaryDetail,
    dispatch // Add dispatch for direct state updates
  } = useScenes();
 const { setSearchQuery, toggleFilters, setSceneTypeFilter } = useScenesOperations();
  const stats = useScenesStats();

  // Load scenes on mount and when screenplayId changes
  useEffect(() => {
    loadScenes();
  }, [loadScenes]);

  // Load breakdowns for visible scenes when in breakdown view
  useEffect(() => {
    if (state.viewMode === 'breakdown' && state.scenes.length > 0) {
      loadBreakdownsForScenes(state.scenes.map(scene => scene.scene_number));
    }
  }, [state.viewMode, state.scenes, loadBreakdownsForScenes]);

  // Handle scene click to open detail panel
  const handleSceneClick = useCallback(async (sceneId: string) => {
    await loadSceneDetail(sceneId);
    if (onSceneSelect) {
      // Get the scene from the state
      const scene = state.scenes.find((s) => s.scene_id === sceneId);
      if (scene) {
        onSceneSelect(scene);
      }
    }
  }, [loadSceneDetail, onSceneSelect, state.scenes]);

  const handleSceneUpdate = useCallback((updatedScene: SceneDetail) => {
    dispatch({ 
      type: 'UPDATE_SCENE', 
      payload: updatedScene 
    });
    
    // Update selected scene if it's the one being updated
    if (state.selectedScene?.scene_id === updatedScene.scene_id) {
      dispatch({ 
        type: 'SET_SELECTED_SCENE', 
        payload: updatedScene 
      });
    }
    
    console.log('Scene updated:', updatedScene);
  }, [dispatch, state.selectedScene?.scene_id]);

  const handleBreakdownUpdate = useCallback(async (breakdown: any) => {
    if (!state.selectedScene) return;
    
    try {
      await updateBreakdown(state.selectedScene.scene_number, breakdown.scene_elements);
      const newBreakdowns = new Map(state.breakdowns);
      newBreakdowns.set(state.selectedScene.scene_number, breakdown);
      dispatch({ 
        type: 'SET_BREAKDOWNS', 
        payload: newBreakdowns 
      });
    } catch (error) {
      console.error('Failed to save breakdown:', error);
    }
  }, [screenplayId, state.selectedScene, state.breakdowns]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className={`flex flex-col transition-all duration-300 min-w-0 flex-1 min-h-0`}>
        <PageHeader
          title="Scenes"
          subtitle={screenplayTitle}
          screenplayId={screenplayId}
          screenplayTitle={screenplayTitle}
          viewMode={state.viewMode}
          totalScenes={stats.totalScenes}
          onViewModeChange={handleViewModeChange}
          onRefreshAllBreakdowns={() => {
            if (state.scenes.length > 0) {
              loadBreakdownsForScenes(state.scenes.map(scene => scene.scene_number));
            }
          }}
          onShowSummaryDetail={handleShowSummaryDetail}
          onSceneAdded={handleSceneAdded}
          onFileManagerOpen={onFileManagerOpen}
          onDailyProductionReportOpen={() => navigate('/daily-production-report')}
          onCallSheetOpen={() => navigate('/call-sheet')}
          onToggleSidebar={onToggleSidebar}
        />

        {/* Scenes Content */}
        <div className="flex w-full overflow-hidden min-h-0 flex-1" ref={scrollContainerRef}>
          <ScenesContent
            loading={state.loading}
            error={state.error}
            scenes={sortedScenes}
            viewMode={state.viewMode}
            selectedScene={state.selectedScene}
            searchQuery={state.searchQuery}
            sceneTypeFilter={state.sceneTypeFilter}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            totalScenes={state.totalScenes}
            breakdowns={state.breakdowns}
            loadingBreakdowns={state.loadingBreakdowns}
            updatingBreakdowns={state.updatingBreakdowns}
            screenplayId={screenplayId}
            onSceneClick={handleSceneClick}
            onSearchChange={setSearchQuery}
            onSceneTypeFilterChange={setSceneTypeFilter}
            onSortChange={handleSortChange}
            onGenerateBreakdown={generateBreakdown}
            onUpdateBreakdown={updateBreakdown}
            onRefreshBreakdown={refreshBreakdown}
            onRetry={() => loadScenes()}
            onSceneAdded={handleSceneAdded}
            className={`${state.showDetailPanel || state.showSummaryPanel ? 'flex-1 min-w-0' : 'flex-1 h-full'}`}
          />
          {state.showDetailPanel && (
            <SceneDetailPanel
              selectedScene={state.selectedScene}
              sceneContext={state.sceneContext}
              detailLoading={state.detailLoading}
              screenplayId={screenplayId}
              onClose={closeDetailPanel}
              onNavigate={navigateScene}
              onSceneUpdate={handleSceneUpdate}
              onSceneDeleted={handleSceneAdded}
              onBreakdownUpdate={handleBreakdownUpdate}
              className="w-1/2 max-w-[50%] h-full border-l border-border"
            />
          )}
          {state.showSummaryPanel && (
            <SummarySidePanel
              summaryData={state.summaryDetailData}
              onClose={closeSummaryPanel}
              className="w-1/2 max-w-[50%] h-full border-l border-border"
            />
          )}
        </div>
      </div>
    </div>
  );
});

ScenesManagerInner.displayName = 'ScenesManagerInner';

const ScenesManager: React.FC<ScenesManagerProps> = memo((props) => {
  return (
    <ScenesProvider screenplayId={props.screenplayId}>
      <ScenesManagerInner {...props} />
    </ScenesProvider>
  );
});

ScenesManager.displayName = 'ScenesManager';

export default ScenesManager;