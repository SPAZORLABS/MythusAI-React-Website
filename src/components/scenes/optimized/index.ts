// Optimized scenes components using context and hooks with original components
export { default as ScenesManager } from '../ScenesManager';
export { default as ScenesContent } from '../ScenesContent';
export { default as ScenesListView } from '../ScenesListView';
export { default as SceneDetailPanel } from '../SceneDetailPanel';

// Context and hooks
export { ScenesProvider, useScenes } from '@/contexts/ScenesContext';
export { 
  useScenesOperations, 
  useScenesStats, 
  useSceneDetail, 
  useBreakdownOperations, 
  useSummaryOperations,
  useViewMode,
  useSearchAndFilter,
  useSort
} from '@/hooks/useScenesOperations';