import React, { useCallback } from 'react';
import { FileText, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Screenplay } from '@/services/api/screenplayService';
import { screenplayService } from '@/services/api/screenplayService';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface ScreenplayListItemProps {
  screenplay: Screenplay;
  isSelected: boolean;
  onClick: (screenplay: Screenplay) => void;
  onDelete: (screenplay: Screenplay) => void;
  truncateTitle: (title: string, maxLength?: number) => string;
}

const ScreenplayListItem: React.FC<ScreenplayListItemProps> = ({
  screenplay,
  isSelected,
  onClick,
  onDelete,
  truncateTitle,
}) => {
  const handleDelete = useCallback(() => {
    onDelete(screenplay);
  }, [onDelete, screenplay]);

  return (
    <ContextMenu className="w-full">
      <div
        className={`w-full group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all duration-150 ${
          isSelected
            ? 'bg-primary/10 border border-primary/20'
            : 'hover:bg-secondary'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(screenplay);
        }}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 bg-blue-50 dark:bg-blue-950/20 rounded-md flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium truncate poppins-text">
              {truncateTitle(screenplay.title)}
            </p>

            {/* Context Menu Trigger */}
            <ContextMenuTrigger asChild>
              <button
                className="p-1 hover:bg-accent rounded-sm"
                onClick={(e) => e.stopPropagation()} // prevent opening item
              >
                <MoreVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </ContextMenuTrigger>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {screenplayService.getRelativeTime(screenplay.created_at)}
              </span>
            </div>
            <Badge variant="secondary" className="px-1.5 py-0 text-xs">
              {screenplay.scene_count}
            </Badge>
          </div>
        </div>
      </div>

      {/* Context Menu Content */}
      <ContextMenuContent className="w-40">
        <ContextMenuItem
          onClick={() => onClick(screenplay)}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={handleDelete}
          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ScreenplayListItem;
