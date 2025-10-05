// components/scenes/ScenesListView.tsx
import React, { useRef, useCallback, useMemo } from 'react';
import { 
  MapPin,
  Hash,
  ChevronRight,
  Plus,
  Clock
} from 'lucide-react';
import { Scene, SceneDetail, scenesService } from '@/services/api/scenesService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AddSceneDialog from './AddSceneDialog';

interface ScenesListViewProps {
  scenes: Scene[];
  selectedScene: SceneDetail | null;
  onSceneClick: (sceneId: string) => void;
  className?: string;
  screenplayId?: string;
  onSceneAdded?: () => void;
}

// Memoized Scene Item Component for performance
const SceneItem = React.memo<{
  scene: Scene;
  isSelected: boolean;
  onClick: (sceneId: string) => void;
}>(({ scene, isSelected, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(scene.scene_id);
  }, [onClick, scene.scene_id]);

  const sceneType = useMemo(() => scenesService.getSceneType(scene.header), [scene.header]);
  const timeOfDay = useMemo(() => scenesService.getTimeOfDay(scene.header), [scene.header]);
  const location = useMemo(() => scenesService.getSceneLocation(scene.header), [scene.header]);

  const getSceneTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'EXT': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'INT': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  }, []);

  return (
    <div
      className={`p-3 cursor-pointer shadow-sm hover:scale-[0.99] transition-all duration-150 rounded-2xl mb-2 border border-border ${
        isSelected 
          ? 'bg-[var(--color-accent)] border-r-2 border-primary' 
          : 'hover:bg-accent/50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0 font-mono">
          {scene.scene_number}
        </Badge>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="secondary"
              className={`text-xs ${getSceneTypeColor(sceneType)}`}
            >
              {sceneType}
            </Badge>
            {timeOfDay && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{timeOfDay}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-medium line-clamp-1 mb-1">
            {scene.header}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
            {scene.body_preview}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-32">{location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>{scene.body_length}</span>
            </div>
          </div>
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
      </div>
    </div>
  );
});

SceneItem.displayName = 'SceneItem';

const ScenesListView: React.FC<ScenesListViewProps> = ({
  scenes,
  selectedScene,
  onSceneClick,
  className = '',
  screenplayId,
  onSceneAdded
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Memoize the rendered scenes list to prevent unnecessary re-renders
  const renderedScenes = useMemo(() => {
    return scenes.map((scene) => (
      <SceneItem
        key={scene.scene_id}
        scene={scene}
        isSelected={selectedScene?.scene_id === scene.scene_id}
        onClick={onSceneClick}
      />
    ));
  }, [scenes, selectedScene?.scene_id, onSceneClick]);

  return (
    <div 
      ref={listRef}
      className={`h-full overflow-y-auto overflow-x-hidden poppins-text ${className}`}
    >
      <div className="p-2">
        <div className="space-y-2">
          {renderedScenes}
        </div>
        
        {/* Add Scene Button */}
        {screenplayId && (
          <div className="flex justify-center py-6 border-t border-border mt-4">
            <AddSceneDialog
              screenplayId={screenplayId}
              onSceneAdded={onSceneAdded}
              showTrigger={true}
              trigger={
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add New Scene
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ScenesListView);
