import React, { useCallback } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { debounce } from './sidebarUtils';

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleCollapse?: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onToggleCollapse
}) => {
  // Debounced search change handler
  const debouncedSearchChange = useCallback(
    debounce((query: string) => {
      onSearchChange(query);
    }, 300),
    [onSearchChange]
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update local state immediately for responsive UI
    e.target.value = value;
    // Debounce the actual search
    debouncedSearchChange(value);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Screenplays</span>
        </div>
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Separator className="my-2" />
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scripts..."
          defaultValue={searchQuery}
          onChange={handleSearchInputChange}
          className="pl-8 text-xs poppins-text rounded-full h-12"
        />
      </div>
    </div>
  );
};

export default SidebarHeader; 