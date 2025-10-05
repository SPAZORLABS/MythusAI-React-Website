import React, { useState, useEffect, useCallback } from 'react';
import { screenplayService, Screenplay, ScreenplayListResponse } from '@/services/api/screenplayService';
import SidebarHeader from './SidebarHeader';
import ExpandedSidebarContent from './ExpandedSidebarContent';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { truncateTitle } from './sidebarUtils';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ScreenplaySidebarProps {
  onScreenplaySelect?: (screenplay: Screenplay) => void;
  selectedScreenplayId?: string | null;
  onToggleCollapse?: () => void;
  onFileManagerOpen?: () => void;
  onSidebarClose?: () => void;
  onSettingsOpen?: () => void;
}

const ScreenplaySidebar: React.FC<ScreenplaySidebarProps> = ({
  onScreenplaySelect,
  selectedScreenplayId,
  onToggleCollapse,
  onFileManagerOpen,
  onSidebarClose,
  onSettingsOpen
}) => {
  const [screenplays, setScreenplays] = useState<Screenplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [screenplayToDelete, setScreenplayToDelete] = useState<Screenplay | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial screenplays
  const loadScreenplays = async (reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setError(null);
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : pagination.page + 1;
      const data: ScreenplayListResponse = await screenplayService.getScreenplays(currentPage, pagination.limit);
      
      if (reset) {
        setScreenplays(data.screenplays);
        setPagination(data.pagination);
      } else {
        setScreenplays(prev => [...prev, ...data.screenplays]);
        setPagination(data.pagination);
      }
    } catch (err: any) {
      setError('Failed to load screenplays');
      console.error('Error loading screenplays:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more screenplays for infinite scroll
  const loadMoreScreenplays = useCallback(async () => {
    if (loadingMore || !pagination.has_next) return;
    await loadScreenplays(false);
  }, [loadingMore, pagination.has_next]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const threshold = 100; // pixels from bottom to trigger load
    
    if (scrollHeight - scrollTop - clientHeight < threshold && !loadingMore && pagination.has_next) {
      loadMoreScreenplays();
    }
  }, [loadingMore, pagination.has_next, loadMoreScreenplays]);

  // Handle screenplay deletion
  const handleScreenplayDelete = useCallback((screenplay: Screenplay) => {
    setScreenplayToDelete(screenplay);
    setDeleteDialogOpen(true);
  }, []);

  // Confirm deletion
  const confirmDelete = async () => {
    console.log('confirmDelete', screenplayToDelete);
    if (!screenplayToDelete) return;
    
    setIsDeleting(true);
    try {
      await screenplayService.deleteScreenplay(screenplayToDelete.id);
      
      // Remove from local state
      setScreenplays(prev => prev.filter(s => s.id !== screenplayToDelete.id));
      
      // Update pagination count
      setPagination(prev => ({
        ...prev,
        total_count: Math.max(0, prev.total_count - 1)
      }));
      
      // Close dialog
      setDeleteDialogOpen(false);
      setScreenplayToDelete(null);
      
      // If the deleted screenplay was selected, clear selection
      if (selectedScreenplayId === screenplayToDelete.id && onScreenplaySelect) {
        onScreenplaySelect(null as any);
      }
      
    } catch (err: any) {
      console.error('Error deleting screenplay:', err);
      // You could show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setScreenplayToDelete(null);
    setIsDeleting(false);
  };

  // Load initial screenplays
  useEffect(() => {
    loadScreenplays(true);
  }, []);

  // Reset screenplays when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search is cleared, reload all screenplays
      loadScreenplays(true);
    } else {
      // For now, we'll filter client-side, but you could implement server-side search
      // by calling a search endpoint instead
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [searchQuery]);

  // Handle screenplay selection
  const handleScreenplayClick = (screenplay: Screenplay) => {
    if (onScreenplaySelect) {
      onScreenplaySelect(screenplay);
    }
  };

  // Animation variants
  const sidebarVariants: Variants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: { 
      x: -100, 
      opacity: 0,
      transition: { 
        ease: "easeInOut", 
        duration: 0.3 
      }
    }
  };

  return (
    <motion.div 
      className="w-72 bg-background border-b-neutral-600 border-r rounded-r-2xl shadow-2xl flex flex-col h-full px-2"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={sidebarVariants}
      layout
    >
      {/* Header */}
      <motion.div
        variants={{
          hidden: { y: -20, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}
      >
        <SidebarHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleCollapse={onToggleCollapse}
        />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="flex-1 overflow-hidden flex flex-col min-h-0"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }}
      >
        <ExpandedSidebarContent
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          screenplays={screenplays}
          selectedScreenplayId={selectedScreenplayId}
          searchQuery={searchQuery}
          pagination={pagination}
          onRefresh={() => loadScreenplays(true)}
          onScreenplayClick={handleScreenplayClick}
          onScreenplayDelete={handleScreenplayDelete}
          onScroll={handleScroll}
          truncateTitle={truncateTitle}
          onFileManagerOpen={onFileManagerOpen}
          onSidebarClose={onSidebarClose}
          onSettingsOpen={onSettingsOpen}
        />
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteDialogOpen && (
          <DeleteConfirmationDialog
            isOpen={deleteDialogOpen}
            screenplay={screenplayToDelete}
            onClose={closeDeleteDialog}
            onConfirm={confirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScreenplaySidebar;