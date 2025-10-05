import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import {
  Eye,
  Play,
  Loader2,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { Scene } from '@/services/api/scenesService';
import { MasterBreakdownResponse, masterBreakdownService, GridExportPayload } from '@/services/api/masterBreakdownService';
import { exportTableToCSV, exportTableToExcel, exportVisibleTableToCSV } from '@/utils/tableExportUtils';

// Extended scene data for table using GridExportPayload structure
type ExtendedScene = {
  scene_id: string;
  scene_number: string;
  header?: string;
  body?: string;
  int_ext?: string;
  day_night?: string;
  location?: string;
  set_name?: string;
  page_num?: string;
  page_eighths?: string;
  est_minutes?: number | string;
  // Breakdown fields
  art_setup?: string;
  background_wardrobe?: string;
  extras?: string;
  featured_artists?: string;
  production_requirements?: string;
  special_equipment?: string;
  [key: string]: any; // Allow for additional dynamic fields
  isLoading?: boolean;
  isUpdating?: boolean;
};

interface ScenesTableViewProps {
  screenplayId: string;
  onViewScene: (sceneId: string) => void;
  onGenerateBreakdown: (sceneNumber: string) => void;
  onUpdateBreakdown?: (sceneNumber: string, breakdown: MasterBreakdownResponse['scene_elements']) => void;
  onRefreshBreakdown: (sceneNumber: string) => void;
  className?: string;
}

const ScenesTableView: React.FC<ScenesTableViewProps> = ({
  screenplayId,
  onViewScene,
  onGenerateBreakdown,
  onUpdateBreakdown,
  onRefreshBreakdown,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hotRef = useRef<Handsontable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gridData, setGridData] = useState<GridExportPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBreakdowns, setLoadingBreakdowns] = useState<Set<string>>(new Set());
  const [updatingBreakdowns, setUpdatingBreakdowns] = useState<Set<string>>(new Set());

  // Load grid data from API
  const loadGridData = useCallback(async () => {
    if (!screenplayId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await masterBreakdownService.exportGrid(screenplayId);
      setGridData(data);
    } catch (err: any) {
      setError(`Failed to load grid data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [screenplayId]);

  // Load data on mount and when screenplayId changes
  useEffect(() => {
    loadGridData();
  }, [loadGridData]);

  // Export handlers
  const handleExportCSV = () => {
    if (hotRef.current) {
      try {
        exportTableToCSV(hotRef.current);
      } catch (error) {
        setError(`Failed to export CSV: ${error}`);
      }
    }
  };

  const handleExportExcel = () => {
    if (hotRef.current) {
      try {
        exportTableToExcel(hotRef.current);
      } catch (error) {
        setError(`Failed to export Excel: ${error}`);
      }
    }
  };

  const handleExportVisibleCSV = () => {
    if (hotRef.current) {
      try {
        exportVisibleTableToCSV(hotRef.current);
      } catch (error) {
        setError(`Failed to export filtered CSV: ${error}`);
      }
    }
  };

  // Prepare data with breakdown information
  const tableData: ExtendedScene[] = useMemo(() => {
    if (!gridData) return [];
    
    try {
      return gridData.rows.map((row) => ({
        ...row,
        scene_id: row.scene_id,
        scene_number: row.scene_number || '',
        isLoading: loadingBreakdowns.has(row.scene_number || ''),
        isUpdating: updatingBreakdowns.has(row.scene_number || ''),
      }));
    } catch (error) {
      setError(`Failed to prepare table data: ${error}`);
      return [];
    }
  }, [gridData, loadingBreakdowns, updatingBreakdowns]);

  // Get all columns including scene metadata and breakdown fields
  const allColumns = useMemo(() => {
    if (!gridData) return [];
    
    // Define scene metadata columns that should be included
    const sceneMetadataColumns = [
      { key: 'int_ext', label: 'INT/EXT', width: '80px' },
      { key: 'day_night', label: 'Day/Night', width: '80px' },
      { key: 'set_name', label: 'Set', width: '120px' },
      { key: 'location', label: 'Location', width: '120px' },
      { key: 'page_num', label: 'Page', width: '60px' },
      { key: 'est_minutes', label: 'Est. Min', width: '80px' }
    ];
    
    // Get breakdown fields (exclude basic scene info columns and scene_id)
    const basicColumns = ['scene_number', 'header', 'body', 'int_ext', 'day_night', 'location', 'set_name', 'page_num', 'page_eighths', 'est_minutes', 'scene_id'];
    const breakdownFields = gridData.columns
      .filter(col => !basicColumns.includes(col))
      .map(col => ({
        key: col,
        label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        width: '150px'
      }));
    
    return [...sceneMetadataColumns, ...breakdownFields];
  }, [gridData]);

  // Custom renderer for scene number column
  const sceneNumberRenderer = useCallback((
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: Handsontable.CellProperties
  ) => {
    td.innerHTML = `<span class="inline-flex items-center px-2.5 py-1 text-xs ">${value}</span>`;
    td.className = 'htMiddle htCenter';
  }, []);

  // Custom renderer for header column
  const headerRenderer = useCallback((
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: Handsontable.CellProperties
  ) => {
    td.innerHTML = `<div class="text-sm font-medium text-gray-900 line-clamp-2 max-w-48 leading-relaxed py-1">${value || ''}</div>`;
    td.className = 'htMiddle';
  }, []);

  // Custom renderer for actions column
  const actionsRenderer = useCallback((
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: Handsontable.CellProperties
  ) => {
    const scene = tableData[row];
    if (!scene) {
      td.innerHTML = '';
      return;
    }

    const viewButton = `<button 
      class="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 mr-2" 
      data-action="view" 
      data-scene-id="${scene.scene_id}"
      title="View Scene"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
    </button>`;

    let generateButton = '';
    let refreshButton = '';
    
    if (!scene.breakdown) {
      if (scene.isLoading) {
        generateButton = `<button 
          class="inline-flex items-center justify-center h-8 w-8 p-0 text-gray-400 cursor-not-allowed bg-gray-50 " 
          disabled
          title="Generating Breakdown..."
        >
          <svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>`;
      } else {
        generateButton = `<button 
          class="inline-flex items-center justify-center h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50  transition-all duration-200" 
          data-action="generate" 
          data-scene-number="${scene.scene_number}"
          title="Generate Breakdown"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" fill="currentColor"></polygon>
          </svg>
        </button>`;
      }
    } else {
      // Scene has breakdown data, show refresh button
      if (scene.isLoading) {
        refreshButton = `<button 
          class="inline-flex items-center justify-center h-8 w-8 p-0 text-gray-400 cursor-not-allowed bg-gray-50 " 
          disabled
          title="Refreshing..."
        >
          <svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>`;
      } else {
        refreshButton = `<button 
          class="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50  transition-all duration-200" 
          data-action="refresh" 
          data-scene-number="${scene.scene_number}"
          title="Refresh Breakdown"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>`;
      }
    }

    td.innerHTML = `<div class="flex items-center justify-center">${viewButton}${generateButton}${refreshButton}</div>`;
    td.className = 'htMiddle htCenter';
  }, [tableData]);

  // Custom renderer for all data fields (scene metadata + breakdown fields)
  const dataFieldRenderer = useCallback((
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: Handsontable.CellProperties
  ) => {
    const scene = tableData[row];
    if (!scene) {
      td.innerHTML = '';
      return;
    }

    const fieldKey = prop as string;
    const fieldValue = scene[fieldKey];
    
    // Define which fields are scene metadata (read-only) vs breakdown fields (editable)
    const sceneMetadataFields = ['int_ext', 'day_night', 'set_name', 'location', 'page_num', 'est_minutes'];
    const isSceneMetadata = sceneMetadataFields.includes(fieldKey);

    if (scene.isLoading) {
      td.innerHTML = `<div class="flex items-center justify-center py-3">
        <svg class="h-4 w-4 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>`;
      td.className = 'htMiddle htCenter';
      cellProperties.readOnly = true;
    } else if (scene.isUpdating) {
      td.innerHTML = `<div class="flex items-center justify-center py-3">
        <svg class="h-4 w-4 animate-spin text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>`;
      td.className = 'htMiddle htCenter';
      cellProperties.readOnly = true;
    } else if (fieldValue && fieldValue !== '') {
      // Style scene metadata differently from breakdown fields
      if (isSceneMetadata) {
        td.innerHTML = `<div class="text-sm text-gray-700 font-medium py-2 px-1 text-center">${fieldValue}</div>`;
        td.className = 'htMiddle htCenter scene-metadata-cell';
        cellProperties.readOnly = true;
      } else {
        td.innerHTML = `<div class="text-sm text-gray-800 leading-relaxed py-2 px-1">${fieldValue}</div>`;
        td.className = 'htMiddle breakdown-cell';
        cellProperties.readOnly = false;
      }
    } else {
      td.innerHTML = `<div class="text-center py-3"><span class="text-gray-400 text-sm">—</span></div>`;
      td.className = 'htMiddle htCenter';
      cellProperties.readOnly = true;
    }
  }, [tableData]);

  // Handle cell clicks for actions
  const handleCellClick = useCallback((row: number, column: number, row2: number, column2: number, selectionLayerLevel: number) => {
    // This will be handled by the afterSelectionEnd event
  }, []);

  // Handle selection end for button clicks
  const handleSelectionEnd = useCallback((row: number, column: number, row2: number, column2: number, selectionLayerLevel: number) => {
    if (!hotRef.current) return;
    
    const cell = hotRef.current.getCell(row, column);
    if (!cell) return;
    
    const button = cell.querySelector('button[data-action]') as HTMLButtonElement;
    if (!button) return;
    
    const action = button.getAttribute('data-action');
    
    if (action === 'view') {
      const sceneId = button.getAttribute('data-scene-id');
      if (sceneId) {
        onViewScene(sceneId);
      }
    } else if (action === 'generate') {
      const sceneNumber = button.getAttribute('data-scene-number');
      if (sceneNumber) {
        onGenerateBreakdown(sceneNumber);
      }
    } else if (action === 'refresh') {
      const sceneNumber = button.getAttribute('data-scene-number');
      if (sceneNumber) {
        onRefreshBreakdown(sceneNumber);
      }
    }
  }, [onViewScene, onGenerateBreakdown, onRefreshBreakdown]);

  // Handle cell value changes for breakdown fields only
  const handleAfterChange = useCallback((
    changes: Handsontable.CellChange[] | null,
    source: Handsontable.ChangeSource
  ) => {
    if (changes && source === 'edit' && onUpdateBreakdown) {
      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (typeof prop === 'string') {
          const scene = tableData[row];
          if (scene) {
            // Only handle breakdown fields, not scene metadata
            const sceneMetadataFields = ['int_ext', 'day_night', 'set_name', 'location', 'page_num', 'est_minutes'];
            const isBreakdownField = !sceneMetadataFields.includes(prop) && allColumns.some(field => field.key === prop);
            
            if (isBreakdownField) {
              // Convert the new value to the format expected by the API
              const breakdownFields = allColumns.filter(field => !sceneMetadataFields.includes(field.key));
              const updatedElements = breakdownFields.map(field => ({
                key: field.key,
                values: field.key === prop ? [newValue] : [scene[field.key] || ''],
                available_values: [] // This will be populated by the API
              }));
              
              // Call the update handler with the updated breakdown elements
              onUpdateBreakdown(scene.scene_number, updatedElements);
            }
          }
        }
      });
    }
  }, [tableData, allColumns, onUpdateBreakdown]);

  // Prepare table data for Handsontable
  const hotData = useMemo(() => {
    return tableData.map(scene => {
      const rowData: any = {
        scene_number: scene.scene_number,
        header: scene.header,
        actions: '', // Placeholder for actions column
      };

      // Add all fields (scene metadata + breakdown fields) from scene data
      // Exclude scene_id from the display
      allColumns.forEach(field => {
        if (field.key !== 'scene_id') {
          rowData[field.key] = scene[field.key] || '';
        }
      });

      return rowData;
    });
  }, [tableData, allColumns]);

  // Column configuration
  const columns = useMemo(() => {
    const baseColumns = [
      {
        data: 'scene_number',
        title: 'Scene Number',
        width: 100,
        readOnly: true,
        renderer: sceneNumberRenderer
      },
      {
        data: 'header',
        title: 'Scene Header',
        width: 250,
        readOnly: true,
        renderer: headerRenderer
      },
      {
        data: 'actions',
        title: 'Actions',
        width: 120,
        readOnly: true,
        renderer: actionsRenderer
      }
    ];

    const dataColumns = allColumns
      .filter(field => field.key !== 'scene_id') // Exclude scene_id from display
      .map(field => {
        const sceneMetadataFields = ['int_ext', 'day_night', 'set_name', 'location', 'page_num', 'est_minutes'];
        const isSceneMetadata = sceneMetadataFields.includes(field.key);
        
        return {
          data: field.key,
          title: field.label,
          width: Math.max(parseInt(field.width?.replace('px', '') || '150'), 80),
          renderer: dataFieldRenderer,
          readOnly: isSceneMetadata // Scene metadata is read-only, breakdown fields are editable
        };
      });

    return [...baseColumns, ...dataColumns];
  }, [allColumns, sceneNumberRenderer, headerRenderer, actionsRenderer, dataFieldRenderer]);

  // Initialize Handsontable
  useEffect(() => {
    if (containerRef.current && hotData.length > 0) {
      try {
        // Destroy existing instance
        if (hotRef.current) {
          hotRef.current.destroy();
        }

        // Create new instance
        hotRef.current = new Handsontable(containerRef.current, {
          data: hotData,
          columns,
          width: '100%',
          height: 'auto',
          stretchH: 'all',
          autoWrapRow: true,
          autoWrapCol: true,
          rowHeaders: true,
          colHeaders: true,
          contextMenu: true,
          filters: true,
          dropdownMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
          licenseKey: 'non-commercial-and-evaluation',
          afterSelectionEnd: handleSelectionEnd,
          afterChange: handleAfterChange,
          cells: (row: number, col: number) => {
            const cellProperties: Partial<Handsontable.CellProperties> = {};
            
            // Make basic info columns read-only
            if (col <= 2) {
              cellProperties.readOnly = true;
            }

            return cellProperties;
          }
        });
        
        setIsInitialized(true);
        setError(null);
      } catch (err: any) {
        setError(`Failed to initialize table: ${err.message}`);
        setIsInitialized(false);
      }
    }

    return () => {
      if (hotRef.current) {
        hotRef.current.destroy();
        hotRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [hotData, columns, handleCellClick, handleAfterChange]);

  // Update data when props change
  useEffect(() => {
    if (hotRef.current && isInitialized) {
      try {
        hotRef.current.loadData(hotData);
      } catch (err: any) {
        setError(`Failed to update table data: ${err.message}`);
      }
    }
  }, [hotData, isInitialized]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900 mb-1">Loading scenes</p>
          <p className="text-sm text-gray-500">Fetching breakdown data...</p>
        </div>
      </div>
    );
  }

  if (!gridData || tableData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <Eye size={48} />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No scenes available</p>
          <p className="text-sm text-gray-500">Scenes will appear here once they are loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col bg-white ${className}`}>
      {/* Header with Export Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Scenes Table</h2>
          <span className="text-sm text-gray-500">
            {tableData.length} scene{tableData.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          {/* <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            title="Export all data to CSV"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </button> */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            title="Export all data to Excel"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
          {/* <button
            onClick={handleExportVisibleCSV}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            title="Export filtered/visible data to CSV"
          >
            <Download className="h-4 w-4" />
            Export Filtered CSV
          </button> */}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 ">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Table Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {!isInitialized && !error && hotData.length > 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">Initializing table</p>
            <p className="text-xs text-gray-500 mt-1">Setting up {hotData.length} scenes...</p>
          </div>
        </div>
      )}
      
      {/* Table Container */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={containerRef} 
          className="w-full h-full min-h-[400px] bg-white"
        />
      </div>
    </div>
  );
};

export default ScenesTableView;