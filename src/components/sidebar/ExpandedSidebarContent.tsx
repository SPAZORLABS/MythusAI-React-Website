import React from 'react';
import { RefreshCw, FileText, Plus, Loader2, Home, FolderOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Screenplay } from '@/services/api/screenplayService';

import { ModeToggle } from '@/components/theme/mode-toggle';
import ScreenplayListItem from './ScreenplayListItem';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PaginationInfo {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ExpandedSidebarContentProps {
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  screenplays: Screenplay[];
  selectedScreenplayId?: string | null;
  searchQuery: string;
  pagination: PaginationInfo;
  onRefresh: () => void;
  onScreenplayClick: (screenplay: Screenplay) => void;
  onScreenplayDelete: (screenplay: Screenplay) => void;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  truncateTitle: (title: string, maxLength?: number) => string;
  onFileManagerOpen?: () => void;
  onSidebarClose?: () => void;
  onSettingsOpen?: () => void;
}

const ExpandedSidebarContent: React.FC<ExpandedSidebarContentProps> = ({
  loading,
  loadingMore,
  error,
  screenplays,
  selectedScreenplayId,
  searchQuery,
  pagination,
  onRefresh,
  onScreenplayClick,
  onScreenplayDelete,
  onScroll,
  truncateTitle,
  onFileManagerOpen,
  onSidebarClose,
  onSettingsOpen
}) => {
  const navigate = useNavigate();
  
  const filteredScreenplays = screenplays.filter(screenplay =>
    String(screenplay.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.01,
        when: "beforeChildren"
      }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.02,
        type: "spring", 
        stiffness: 500, 
        damping: 20 
      }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Actions */}
      <motion.div 
        className="px-3 py-2 flex items-center justify-between"
        variants={itemVariants as any}
      >
        <span className="text-xs text-muted-foreground">
          {filteredScreenplays.length} of {pagination.total_count} script{filteredScreenplays.length !== 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>

      {/* Screenplay List */}
      <motion.div
        className="flex-1 overflow-y-auto pb-2 min-h-0"
        onScroll={onScroll}
        variants={containerVariants}
      >
        <motion.div 
          className="w-full "
          variants={itemVariants}
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-2 flex items-center gap-2 justify-center poppins-text rounded-full"
            onClick={() => window.location.href = '/new'}
          >
            <Plus className="h-4 w-4" />
            Add Script
          </Button>
        </motion.div>
        {loading ? (
          <motion.div 
            className="flex items-center justify-center py-8 poppins-text"
            variants={itemVariants}
          >
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="text-center py-8 poppins-text"
            variants={itemVariants}
          >
            <p className="text-xs text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="mt-2"
            >
              Retry
            </Button>
          </motion.div>
        ) : filteredScreenplays.length === 0 ? (
          <motion.div 
            className="text-center py-8 poppins-text"
            variants={itemVariants}
          >
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">
              {searchQuery ? 'No matches found' : 'No screenplays'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-1 poppins-text">
            <AnimatePresence>
              {filteredScreenplays.map((screenplay) => (
                <motion.div 
                  key={screenplay.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <ScreenplayListItem
                    screenplay={screenplay}
                    isSelected={selectedScreenplayId === screenplay.id}
                    onClick={onScreenplayClick}
                    onDelete={onScreenplayDelete}
                    truncateTitle={truncateTitle}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading More Indicator */}
            {loadingMore && (
              <motion.div 
                className="flex items-center justify-center py-4 poppins-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              </motion.div>
            )}

            {/* End of List Indicator */}
            {!pagination.has_next && filteredScreenplays.length > 0 && (
              <motion.div 
                className="text-center py-4 poppins-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-xs text-muted-foreground">
                  You've reached the end of the list
                </p>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Bottom Actions - Expanded */}
      <div className="border-border p-2 poppins-text">
        <div className="space-y-1">
          {/* Dashboard Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate('/');
              if (onSidebarClose) {
                onSidebarClose();
              }
            }}
            className="w-full justify-start gap-2 h-9 text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          
          {/* Files Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onFileManagerOpen) {
                onFileManagerOpen();
              } else {
                navigate('/file-manager');
              }
            }}
            className="w-full justify-start gap-2 h-9 text-sm font-medium"
          >
            <FolderOpen className="h-4 w-4" />
            Files
          </Button>
          
          {/* Settings Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onSettingsOpen) {
                onSettingsOpen();
              } 
              if (onSidebarClose) {
                onSidebarClose();
              }
            }}
            className="w-full justify-start gap-2 h-9 text-sm font-medium"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>          
            <ModeToggle />
        </div>
      </div>
    </>
  );
};

export default ExpandedSidebarContent;