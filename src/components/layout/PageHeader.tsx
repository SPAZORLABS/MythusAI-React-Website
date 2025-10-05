import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  List,
  FolderOpen,
  Menu,
  RefreshCw,
  Calendar,
  Clipboard,
  Settings,
} from 'lucide-react';
import ScreenplaySummaryStatus from '@/components/scenes/ScreenplaySummaryStatus';
import AddSceneDialog from '@/components/scenes/AddSceneDialog';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  screenplayId?: string;
  screenplayTitle?: string;
  onToggleSidebar?: () => void;
  onFileManagerOpen?: () => void;
  viewMode?: 'list' | 'breakdown';
  onViewModeChange?: (mode: 'list' | 'breakdown') => void;
  onSceneAdded?: () => void;
  onRefreshAllBreakdowns?: () => void;
  onDailyProductionReportOpen?: () => void;
  onCallSheetOpen?: () => void;
  totalScenes?: number;
  filteredScenesCount?: number;
  onShowSummaryDetail?: (summaryData: any) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  screenplayId,
  screenplayTitle,
  onToggleSidebar,
  onFileManagerOpen,
  viewMode,
  onViewModeChange,
  onSceneAdded,
  onRefreshAllBreakdowns,
  onDailyProductionReportOpen,
  onCallSheetOpen,
  totalScenes,
  filteredScenesCount,
  onShowSummaryDetail,
}) => {
  const navigate = useNavigate();
  const toolbarButtonClass = "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap";
  const toolbarIconButtonClass = "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  return (
    <div className="border-b border-border bg-secondary backdrop-blur-sm shadow-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={toolbarIconButtonClass}
              title="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
          
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-wrap gap-3 px-4 py-3 bg-muted/20">
        {/* File Operations Group */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-border/30">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Files
          </div>
          <div className="flex items-center gap-1">
            {screenplayId && (
              <AddSceneDialog
                screenplayId={screenplayId}
                onSceneAdded={onSceneAdded}
              >
                
              </AddSceneDialog>
            )}
            
            <button
              onClick={onFileManagerOpen}
              className={cn(toolbarButtonClass, "h-8 px-2 text-xs hover:bg-accent")}
              title="File Manager"
            >
              <FolderOpen className="h-3 w-3" />
              <span className="hidden sm:inline">Manager</span>
            </button>
          </div>
        </div>

        {/* View Mode Group */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-background/50 border border-border/30">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            View
          </div>
          <div className="flex gap-1 items-center bg-muted/50 rounded-md p-0.5">
            <button
              onClick={() => {
                if (onViewModeChange) {
                  onViewModeChange('list');
                } else {
                  navigate('/script');
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded transition-colors border border-border ",
                viewMode === 'list' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              )}
            >
              <List className="h-3 w-3" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
                  onClick={() => navigate(`/screenplay/master-breakdown`)}
                  className={cn(toolbarButtonClass, `h-8 px-2 text-xs ${viewMode != 'list' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"}
              `)}
                  title="Master Breakdown"
                >
                  <Table className="h-3 w-3" />
                  <span className="hidden lg:inline">Breakdown</span>
                </button>
          </div>
        </div>

        {/* Production Tools Group */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-background/50 border border-border/30">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Production
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onDailyProductionReportOpen || (() => navigate('/screenplay/daily-production-report'))}
              className={cn(toolbarButtonClass, "h-8 px-2 text-xs")}
              title="Daily Production Report"
            >
              <Calendar className="h-3 w-3" />
              <span className="hidden md:inline">Daily</span>
            </button>
            
            <button
              onClick={onCallSheetOpen || (() => navigate('/screenplay/call-sheet'))}
              className={cn(toolbarButtonClass, "h-8 px-2 text-xs")}
              title="Call Sheet"
            >
              <Clipboard className="h-3 w-3" />
              <span className="hidden md:inline">Call Sheet</span>
            </button>
            
            {screenplayId && (
              <>
                <button
                  onClick={() => navigate(`/screenplay/production-info/${screenplayId}`)}
                  className={cn(toolbarButtonClass, "h-8 px-2 text-xs")}
                  title="Production Info"
                >
                  <Settings className="h-3 w-3" />
                  <span className="hidden lg:inline">Info</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* AI Tools Group */}
        {screenplayId && screenplayTitle && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-background/50 border border-border/30">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              AI Tools
            </div>
            <div className="flex items-center gap-1">
              <ScreenplaySummaryStatus
                screenplayId={screenplayId}
                screenplayTitle={screenplayTitle}
                onShowSummaryDetail={onShowSummaryDetail}
              />
              
              {viewMode === 'breakdown' && onRefreshAllBreakdowns && (
                <button
                  onClick={onRefreshAllBreakdowns}
                  className={cn(toolbarButtonClass, "h-8 px-2 text-xs")}
                  title="Refresh All Breakdowns"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scene Count Badge */}
        {filteredScenesCount !== undefined && totalScenes !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 ml-auto">
            <div className="text-xs font-medium text-primary">
              {filteredScenesCount} of {totalScenes} scenes
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
