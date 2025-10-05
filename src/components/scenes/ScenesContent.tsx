// components/scenes/ScenesContent.tsx
import React from 'react';
import { 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Scene, SceneDetail } from '@/services/api/scenesService';
import { MasterBreakdownResponse } from '@/services/api/masterBreakdownService';
import { Button } from '@/components/ui/button';
import ScenesListView from './ScenesListView';
import ScenesFilterHeader from './ScenesFilterHeader';

interface ScenesContentProps {
  loading: boolean;
  error: string | null;
  scenes: Scene[];
  viewMode: 'list' | 'breakdown';
  selectedScene: SceneDetail | null;
  searchQuery: string;
  sceneTypeFilter: 'all' | 'EXT' | 'INT';
  sortBy: 'scene_number' | 'header' | 'body_length' | 'location';
  sortOrder: 'asc' | 'desc';
  breakdowns: Map<string, MasterBreakdownResponse>;
  loadingBreakdowns: Set<string>;
  updatingBreakdowns: Set<string>;
  totalScenes: number;
  screenplayId: string;
  onSceneClick: (sceneId: string) => void;
  onSearchChange: (query: string) => void;
  onSceneTypeFilterChange: (filter: 'all' | 'EXT' | 'INT') => void;
  onSortChange: (sortBy: any, sortOrder: 'asc' | 'desc') => void;
  onGenerateBreakdown: (sceneNumber: string) => void;
  onUpdateBreakdown: (sceneNumber: string, breakdown: MasterBreakdownResponse['scene_elements']) => void;
  onRefreshBreakdown: (sceneNumber: string) => void;
  onRetry: () => void;
  onSceneAdded?: () => void;
  className?: string;
}

const ScenesContent: React.FC<ScenesContentProps> = ({
  loading,
  error,
  scenes,
  viewMode,
  selectedScene,
  searchQuery,
  sceneTypeFilter,
  sortBy,
  sortOrder,
  totalScenes,
  screenplayId,
  onSceneClick,
  onSearchChange,
  onSceneTypeFilterChange,
  onSortChange,
  onRetry,
  onSceneAdded,
  className
}) => {
  const handleClearFilters = () => {
    onSearchChange('');
    onSceneTypeFilterChange('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading scenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="text-sm font-medium mb-1">Failed to load scenes</h3>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Filter Header */}
      <ScenesFilterHeader
        searchQuery={searchQuery}
        sceneTypeFilter={sceneTypeFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        totalScenes={totalScenes}
        filteredCount={scenes.length}
        onSearchChange={onSearchChange}
        onSceneTypeFilterChange={onSceneTypeFilterChange}
        onSortChange={onSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {scenes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-sm font-medium mb-1">
                {searchQuery || sceneTypeFilter !== 'all' ? 'No matching scenes' : 'No scenes found'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery || sceneTypeFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms' 
                  : 'Get started by adding your first scene'
                }
              </p>
              {(searchQuery || sceneTypeFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ScenesListView
            scenes={scenes}
            selectedScene={selectedScene}
            onSceneClick={onSceneClick}
            screenplayId={screenplayId}
            onSceneAdded={onSceneAdded}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ScenesContent);
