// components/masterBreakdown/MasterBreakdownEditor.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { 
  CheckIcon, 
  ChevronsUpDownIcon, 
  Plus, 
  X, 
  Save, 
  RotateCcw, 
  Edit3, 
  Download, 
  FileSpreadsheet, 
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MasterBreakdownResponse, SceneElementBreakdown } from '@/services/api/masterBreakdownService';
import { cn } from '@/lib/utils';
import {
  exportToCSV,
  exportToExcel,
  exportToCSVStructured,
  exportToExcelStructured
} from '@/utils/exportUtils';

interface MasterBreakdownEditorProps {
  breakdown: MasterBreakdownResponse | null;
  screenplayId: string;
  sceneId: string;
  onUpdate: (breakdown: MasterBreakdownResponse) => void;
  isUpdating?: boolean;
  className?: string;
}

const MasterBreakdownEditor: React.FC<MasterBreakdownEditorProps> = ({
  breakdown,
  screenplayId,
  sceneId,
  onUpdate,
  isUpdating = false,
  className = ''
}) => {
  const [localBreakdown, setLocalBreakdown] = useState<MasterBreakdownResponse | null>(breakdown);
  const [hasChanges, setHasChanges] = useState(false);
  const [customInputMode, setCustomInputMode] = useState<Map<string, Map<number, boolean>>>(new Map());
  const [customInputValues, setCustomInputValues] = useState<Map<string, Map<number, string>>>(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchFilters, setSearchFilters] = useState<Map<string, string>>(new Map());

  // Auto-expand sections with values on first load
  useEffect(() => {
    if (breakdown && expandedSections.size === 0) {
      const sectionsWithValues = new Set<string>();
      breakdown.scene_elements.forEach(element => {
        if (element.values && element.values.length > 0) {
          sectionsWithValues.add(element.key);
        }
      });
      // Always expand at least the first 3 sections
      if (sectionsWithValues.size === 0) {
        breakdown.scene_elements.slice(0, 3).forEach(element => {
          sectionsWithValues.add(element.key);
        });
      }
      setExpandedSections(sectionsWithValues);
    }
  }, [breakdown]);

  // Update local state when prop changes
  useEffect(() => {
    setLocalBreakdown(breakdown);
    setHasChanges(false);
    setCustomInputMode(new Map());
    setCustomInputValues(new Map());
  }, [breakdown]);

  // Memoized processed values to prevent recalculation
  const processedElements = useMemo(() => {
    if (!localBreakdown) return [];
    
    return localBreakdown.scene_elements.map(element => {
      const processedValues = element.values.flatMap((value) => {
        if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
          } catch { }
        }
        return [value];
      });

      return {
        ...element,
        processedValues,
        hasValues: processedValues.some(val => val && val.toString().trim())
      };
    });
  }, [localBreakdown]);

  // Handle value changes for a specific element
  const handleValueChange = useCallback((elementKey: string, newValues: (string | number | null)[]) => {
    if (!localBreakdown) return;

    const updatedElements = localBreakdown.scene_elements.map(element => {
      if (element.key === elementKey) {
        return { ...element, values: newValues };
      }
      return element;
    });

    const updatedBreakdown = {
      ...localBreakdown,
      scene_elements: updatedElements
    };

    setLocalBreakdown(updatedBreakdown);
    setHasChanges(true);
  }, [localBreakdown]);

  // Toggle custom input mode for a specific value
  const toggleCustomInputMode = useCallback((elementKey: string, valueIndex: number) => {
    const newCustomInputMode = new Map(customInputMode);
    if (!newCustomInputMode.has(elementKey)) {
      newCustomInputMode.set(elementKey, new Map());
    }

    const elementMap = newCustomInputMode.get(elementKey)!;
    const currentMode = elementMap.get(valueIndex) || false;
    elementMap.set(valueIndex, !currentMode);

    setCustomInputMode(newCustomInputMode);

    // If switching to custom input mode, initialize the custom value
    if (!currentMode) {
      const newCustomInputValues = new Map(customInputValues);
      if (!newCustomInputValues.has(elementKey)) {
        newCustomInputValues.set(elementKey, new Map());
      }

      const elementValues = newCustomInputValues.get(elementKey)!;
      const currentValue = localBreakdown?.scene_elements.find(el => el.key === elementKey)?.values[valueIndex];
      elementValues.set(valueIndex, currentValue ? String(currentValue) : '');

      setCustomInputValues(newCustomInputValues);
    }
  }, [customInputMode, customInputValues, localBreakdown]);

  // Handle custom input value change
  const handleCustomInputChange = useCallback((elementKey: string, valueIndex: number, newValue: string) => {
    const newCustomInputValues = new Map(customInputValues);
    if (!newCustomInputValues.has(elementKey)) {
      newCustomInputValues.set(elementKey, new Map());
    }

    const elementValues = newCustomInputValues.get(elementKey)!;
    elementValues.set(valueIndex, newValue);
    setCustomInputValues(newCustomInputValues);
  }, [customInputValues]);

  // Apply custom input value
  const applyCustomInput = useCallback((elementKey: string, valueIndex: number) => {
    const customValue = customInputValues.get(elementKey)?.get(valueIndex);
    if (customValue !== undefined && localBreakdown) {
      const trimmedValue = customValue.trim();

      if (trimmedValue === '') {
        removeValue(elementKey, valueIndex);
        return;
      }

      const updatedElements = localBreakdown.scene_elements.map(element => {
        if (element.key === elementKey) {
          const newValues = [...element.values];
          newValues[valueIndex] = trimmedValue;
          return { ...element, values: newValues };
        }
        return element;
      });

      const updatedBreakdown = {
        ...localBreakdown,
        scene_elements: updatedElements
      };

      setLocalBreakdown(updatedBreakdown);
      setHasChanges(true);

      // Exit custom input mode
      toggleCustomInputMode(elementKey, valueIndex);
    }
  }, [customInputValues, localBreakdown, toggleCustomInputMode]);

  // Add a new value to an element
  const addValue = useCallback((elementKey: string) => {
    if (!localBreakdown) return;

    const updatedElements = localBreakdown.scene_elements.map(element => {
      if (element.key === elementKey) {
        return { ...element, values: [...element.values, ''] };
      }
      return element;
    });

    const updatedBreakdown = {
      ...localBreakdown,
      scene_elements: updatedElements
    };

    setLocalBreakdown(updatedBreakdown);
    setHasChanges(true);

    // Automatically enable custom input mode for the new value
    const newValueIndex = updatedElements.find(el => el.key === elementKey)!.values.length - 1;
    setTimeout(() => {
      toggleCustomInputMode(elementKey, newValueIndex);
    }, 100);
  }, [localBreakdown, toggleCustomInputMode]);

  // Remove a value from an element
  const removeValue = useCallback((elementKey: string, valueIndex: number) => {
    if (!localBreakdown) return;

    const updatedElements = localBreakdown.scene_elements.map(element => {
      if (element.key === elementKey) {
        const newValues = element.values.filter((_, index) => index !== valueIndex);
        return { ...element, values: newValues };
      }
      return element;
    });

    const updatedBreakdown = {
      ...localBreakdown,
      scene_elements: updatedElements
    };

    setLocalBreakdown(updatedBreakdown);
    setHasChanges(true);
  }, [localBreakdown]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!localBreakdown || !hasChanges) return;

    try {
      onUpdate(localBreakdown);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save breakdown:', error);
    }
  }, [localBreakdown, hasChanges, onUpdate]);

  // Handle reset
  const handleReset = useCallback(() => {
    setLocalBreakdown(breakdown);
    setHasChanges(false);
    setCustomInputMode(new Map());
    setCustomInputValues(new Map());
  }, [breakdown]);

  const toggleSection = useCallback((elementKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(elementKey)) {
      newExpanded.delete(elementKey);
    } else {
      newExpanded.add(elementKey);
    }
    setExpandedSections(newExpanded);
  }, [expandedSections]);

  const getFilteredAvailableValues = useCallback((elementKey: string, availableValues: any[]) => {
    const searchTerm = searchFilters.get(elementKey) || '';
    if (!searchTerm) return availableValues;
    
    return availableValues.filter(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchFilters]);

  if (!localBreakdown) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            Master Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No breakdown data available for this scene</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-l-2 border-l-primary/20 bg-secondary text-secondary-foreground", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Master Breakdown
            </CardTitle>
            {hasChanges && (
              <Badge variant="secondary" className="text-xs animate-pulse bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{processedElements.length} categories</span>
          <span>{processedElements.filter(el => el.hasValues).length} with values</span>
          <span>{expandedSections.size} expanded</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Breakdown Elements */}
        <div className="space-y-4">
          {processedElements.map((element) => {
            const isExpanded = expandedSections.has(element.key);
            
            return (
              <div key={element.key} className="border border-border rounded-lg">
                {/* Element Header */}
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors rounded-t-lg"
                  onClick={() => toggleSection(element.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize text-left">
                      {element.key.replace(/_/g, ' ')}
                    </span>
                    {element.hasValues && (
                      <Badge variant="outline" className="text-xs">
                        {element.processedValues.filter(val => val && val.toString().trim()).length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {/* Element Content */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    {/* Search filter for available values */}
                    {element.available_values.length > 10 && (
                      <div className="mb-3">
                        <Input
                          placeholder="Search available values..."
                          value={searchFilters.get(element.key) || ''}
                          onChange={(e) => {
                            const newFilters = new Map(searchFilters);
                            newFilters.set(element.key, e.target.value);
                            setSearchFilters(newFilters);
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    )}

                    {/* Values */}
                    <div className="space-y-3">
                      {element.processedValues.map((value, valueIndex) => {
                        const isCustomInput = customInputMode.get(element.key)?.get(valueIndex) || false;
                        const customValue = customInputValues.get(element.key)?.get(valueIndex) || "";

                        return (
                          <div key={valueIndex} className="flex items-center gap-3">
                            {isCustomInput ? (
                              // Custom input mode
                              <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 relative">
                                  <Input
                                    value={customValue}
                                    onChange={(e) =>
                                      handleCustomInputChange(element.key, valueIndex, e.target.value)
                                    }
                                    placeholder="Enter custom value..."
                                    className="flex-1 pr-20 border-primary/50 focus:border-primary text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") applyCustomInput(element.key, valueIndex);
                                      if (e.key === "Escape") {
                                        const newMode = new Map(customInputMode);
                                        newMode.get(element.key)?.set(valueIndex, false);
                                        setCustomInputMode(newMode);
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                      Custom
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => applyCustomInput(element.key, valueIndex)}
                                  className="h-8 px-3 text-xs"
                                  disabled={!customValue.trim()}
                                >
                                  Apply
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newMode = new Map(customInputMode);
                                    newMode.get(element.key)?.set(valueIndex, false);
                                    setCustomInputMode(newMode);
                                  }}
                                  className="h-8 px-3 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              // Dropdown mode
                              <div className="flex-1 flex items-center gap-2 min-w-0">
                                <Listbox
                                  value={value}
                                  onChange={(newValue) => {
                                    if (newValue === "__CUSTOM__") {
                                      toggleCustomInputMode(element.key, valueIndex);
                                      return;
                                    }
                                    const newValues = [...element.values];
                                    newValues[valueIndex] = newValue;
                                    handleValueChange(element.key, newValues);
                                  }}
                                >
                                  <div className="relative flex-1 min-w-0">
                                    <ListboxButton className="relative w-full cursor-default rounded-lg bg-background border border-input py-2.5 pl-3 pr-10 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="block flex-1 min-w-0 truncate">
                                          {value || "Select a value..."}
                                        </span>
                                        {value && !element.available_values.includes(value) && (
                                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Custom
                                          </span>
                                        )}
                                      </div>
                                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronsUpDownIcon
                                          className="h-4 w-4 text-muted-foreground"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </ListboxButton>

                                    <Transition
                                      as={React.Fragment}
                                      leave="transition ease-in duration-100"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <ListboxOptions className="absolute z-50 mt-1 max-h-60 min-w-full max-w-sm overflow-auto rounded-lg bg-popover border border-border py-1 shadow-xl focus:outline-none">
                                        {/* Custom option */}
                                        <ListboxOption
                                          className={({ active }) =>
                                            cn(
                                              "relative cursor-pointer select-none py-2 px-3 text-sm",
                                              active ? "bg-accent text-accent-foreground" : "text-popover-foreground",
                                              "border-b border-border/50"
                                            )
                                          }
                                          value="__CUSTOM__"
                                        >
                                          <span className="block font-medium text-primary">
                                            Add Custom Value...
                                          </span>
                                        </ListboxOption>

                                        {/* Available values */}
                                        {getFilteredAvailableValues(element.key, element.available_values).map((availableValue, index) => (
                                          <ListboxOption
                                            key={index}
                                            className={({ active, selected }) =>
                                              cn(
                                                "relative cursor-pointer select-none py-2 px-3 text-sm",
                                                active ? "bg-accent text-accent-foreground" : "text-popover-foreground",
                                                selected && "bg-primary/10 text-primary font-medium"
                                              )
                                            }
                                            value={availableValue}
                                          >
                                            {({ selected }) => (
                                              <div className="flex items-center">
                                                {selected && (
                                                  <CheckIcon className="h-3 w-3 mr-2" aria-hidden="true" />
                                                )}
                                                <span className="block truncate">
                                                  {availableValue}
                                                </span>
                                              </div>
                                            )}
                                          </ListboxOption>
                                        ))}
                                      </ListboxOptions>
                                    </Transition>
                                  </div>
                                </Listbox>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCustomInputMode(element.key, valueIndex)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                  title="Add custom value"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}

                            {/* Remove Value Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeValue(element.key, valueIndex)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Remove value"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}

                      {/* Add Value Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addValue(element.key)}
                        className="gap-2 text-xs border-dashed hover:border-primary/50 hover:text-primary transition-all duration-200 w-full"
                      >
                        <Plus className="h-3 w-3" />
                        Add {element.key.replace(/_/g, ' ')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex items-center gap-3 pt-6 border-t border-border bg-muted/30 -mx-6 px-6 py-4 mt-6">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 gap-2 shadow-sm"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isUpdating}
              className="gap-2"
              size="sm"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        )}

        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Updating breakdown...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(MasterBreakdownEditor);
