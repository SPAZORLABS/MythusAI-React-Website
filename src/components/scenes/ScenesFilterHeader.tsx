// components/scenes/ScenesFilterHeader.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  ChevronDown,
  X,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ScenesFilterHeaderProps {
  searchQuery: string;
  sceneTypeFilter: 'all' | 'EXT' | 'INT';
  sortBy: 'scene_number' | 'header' | 'body_length' | 'location';
  sortOrder: 'asc' | 'desc';
  totalScenes: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onSceneTypeFilterChange: (filter: 'all' | 'EXT' | 'INT') => void;
  onSortChange: (sortBy: any, sortOrder: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

const ScenesFilterHeader: React.FC<ScenesFilterHeaderProps> = ({
  searchQuery,
  sceneTypeFilter,
  sortBy,
  sortOrder,
  totalScenes,
  filteredCount,
  onSearchChange,
  onSceneTypeFilterChange,
  onSortChange,
  onClearFilters
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const sortOptions = [
    { value: 'scene_number', label: 'Scene Number' },
    { value: 'header', label: 'Scene Header' },
    { value: 'body_length', label: 'Content Length' },
    { value: 'location', label: 'Location' }
  ];

  const hasActiveFilters = searchQuery || sceneTypeFilter !== 'all';
  const isFiltered = filteredCount !== totalScenes;

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Search & Filters */}
        <div className="flex items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scenes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant={hasActiveFilters ? "default" : "outline"} 
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {(searchQuery ? 1 : 0) + (sceneTypeFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClearFilters}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Scene Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Scene Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: 'All', count: totalScenes },
                      { value: 'EXT', label: 'Exterior', count: 0 }, // You'd calculate these
                      { value: 'INT', label: 'Interior', count: 0 }
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={sceneTypeFilter === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSceneTypeFilterChange(type.value as any)}
                        className="justify-center"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Section - Sort & Results */}
        <div className="flex items-center gap-3">
          {/* Results Count */}
          {isFiltered && (
            <span className="text-sm text-muted-foreground">
              {filteredCount} of {totalScenes} scenes
            </span>
          )}

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Sort
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2">
                <div className="text-sm font-medium mb-2">Sort by</div>
                <DropdownMenuRadioGroup 
                  value={sortBy} 
                  onValueChange={(value) => onSortChange(value, sortOrder)}
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortDesc className="mr-2 h-4 w-4" />
                    Sort Descending
                  </>
                ) : (
                  <>
                    <SortAsc className="mr-2 h-4 w-4" />
                    Sort Ascending
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ScenesFilterHeader;
