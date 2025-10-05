import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MasterBreakdownResponse } from '@/services/api/masterBreakdownService';
import { MasterBreakdownEditor } from '@/components/masterBreakdown';
import ScenesTableView from '@/components/masterBreakdown/ScenesTableView';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Screenplay } from '@/services/api/screenplayService';
import { masterBreakdownService } from '@/services/api/masterBreakdownService';
import { Loader2 } from 'lucide-react';

interface MasterBreakdownPageProps {
  selectedScreenplay: Screenplay | null;
  onToggleSidebar: () => void;
  onFileManagerOpen?: () => void;
}

const MasterBreakdownPage: React.FC<MasterBreakdownPageProps> = React.memo(({
  selectedScreenplay,
  onToggleSidebar,
  onFileManagerOpen
}) => {
  const { sceneId } = useParams<{ sceneId: string }>();
  const [activeBreakdown, setActiveBreakdown] = useState<MasterBreakdownResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('table');

  // Memoize screenplay ID to prevent unnecessary re-renders
  const screenplayId = useMemo(() => selectedScreenplay?.id, [selectedScreenplay?.id]);

  // Load breakdown when sceneId changes
  useEffect(() => {
    if (sceneId && screenplayId) {
      loadBreakdown(sceneId);
      setActiveTab('editor');
    }
  }, [sceneId, screenplayId]);

  // Load breakdown data for a specific scene
  const loadBreakdown = useCallback(async (sceneId: string) => {
    if (!screenplayId || !sceneId) return;
    
    setIsLoading(true);
    try {
      const breakdown = await masterBreakdownService.getBreakdown(screenplayId, sceneId);
      setActiveBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to load breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  }, [screenplayId]);

  // Handle generating a breakdown for a scene
  const handleGenerateBreakdown = useCallback(async (sceneNumber: string) => {
    if (!screenplayId) return;
    
    setIsLoading(true);
    try {
      const breakdown = await masterBreakdownService.generateSceneBreakdown(
        screenplayId,
        sceneNumber
      );
      setActiveBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to generate breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  }, [screenplayId]);

  // Handle refreshing a breakdown for a scene
  const handleRefreshBreakdown = useCallback(async (sceneNumber: string) => {
    if (!screenplayId) return;
    
    setIsLoading(true);
    try {
      const breakdown = await masterBreakdownService.refreshBreakdown(
        screenplayId,
        sceneNumber
      );
      setActiveBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to refresh breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  }, [screenplayId]);

  // Handle updating a breakdown
  const handleUpdateBreakdown = useCallback(async (updatedBreakdown: MasterBreakdownResponse) => {
    if (!screenplayId || !sceneId) return;
    
    setIsUpdating(true);
    try {
      await masterBreakdownService.updateBreakdown(
        screenplayId,
        sceneId,
        updatedBreakdown
      );
      setActiveBreakdown(updatedBreakdown);
    } catch (error) {
      console.error('Failed to update breakdown:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [screenplayId, sceneId]);

  // Handle viewing a specific scene
  const handleViewScene = useCallback((sceneId: string) => {
    if (sceneId) {
      loadBreakdown(sceneId);
      setActiveTab('editor');
    }
  }, [loadBreakdown]);

  // Memoize tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Memoize the header component to prevent re-renders
  const pageHeader = useMemo(() => (
    <PageHeader
      title="Master Breakdown"
      onToggleSidebar={onToggleSidebar}
      onFileManagerOpen={onFileManagerOpen}
      screenplayId={screenplayId}
    />
  ), [onToggleSidebar, onFileManagerOpen, screenplayId]);

  // Memoize the editor content to prevent re-renders
  const editorContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading breakdown...</span>
        </div>
      );
    }
    
    if (sceneId && screenplayId) {
      return (
        <MasterBreakdownEditor
          breakdown={activeBreakdown}
          screenplayId={screenplayId}
          sceneId={sceneId}
          onUpdate={handleUpdateBreakdown}
          isUpdating={isUpdating}
        />
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a scene from the table to view its breakdown
      </div>
    );
  }, [isLoading, sceneId, screenplayId, activeBreakdown, handleUpdateBreakdown, isUpdating]);

  // Memoize the table content to prevent re-renders
  const tableContent = useMemo(() => {
    if (!screenplayId) return null;
    
    return (
      <ScenesTableView
        screenplayId={screenplayId}
        onViewScene={handleViewScene}
        onGenerateBreakdown={handleGenerateBreakdown}
        onRefreshBreakdown={handleRefreshBreakdown}
        className="h-full"
      />
    );
  }, [screenplayId, handleViewScene, handleGenerateBreakdown, handleRefreshBreakdown]);

  return (
    <div className="flex flex-col h-full">
      {pageHeader}
      
      <div className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Scenes Table</TabsTrigger>
            <TabsTrigger value="editor">Breakdown Editor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="h-full">
            {tableContent}
          </TabsContent>
          
          <TabsContent value="editor" className="h-full">
            {editorContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

export default MasterBreakdownPage;