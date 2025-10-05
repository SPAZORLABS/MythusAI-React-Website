import React, { useRef } from 'react';
import { useCallSheet } from '@/contexts/CallSheetContext';
import { CallSheetSchema, createEmptyCallSheet } from '@/types/callSheet';
import { usePdfExport } from '@/hooks/usePdfExport';

interface ToolbarProps {
  callSheetRef: React.RefObject<HTMLDivElement>;
}

export function Toolbar({ callSheetRef }: ToolbarProps) {
  const { data, dispatch } = useCallSheet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Export hook
  const { exportPdf, busy: pdfBusy, error: pdfError } = usePdfExport({
    targetRef: callSheetRef,
    filename: `call-sheet-${data.day || 'day'}-${data.shootDate || 'date'}.pdf`,
    orientation: 'portrait',
    format: 'a4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    scale: 2,
    excludeSelectors: [
      '.screen-only',
      'button',
      '[data-no-print]'
    ]
  });

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'call-sheet.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const validatedData = CallSheetSchema.parse(jsonData);
          dispatch({ type: 'LOAD_DATA', data: validatedData });
        } catch (error) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      dispatch({ type: 'RESET' });
    }
  };

  const handlePrint = () => {
    // Hide screen-only elements and show print-only elements
    const screenElements = document.querySelectorAll('.screen-only');
    const printElements = document.querySelectorAll('.print-only');
    
    screenElements.forEach(el => (el as HTMLElement).style.display = 'none');
    printElements.forEach(el => (el as HTMLElement).style.display = 'block');
    
    // Trigger print
    window.print();
    
    // Restore elements after print dialog
    setTimeout(() => {
      screenElements.forEach(el => (el as HTMLElement).style.display = '');
      printElements.forEach(el => (el as HTMLElement).style.display = '');
    }, 100);
  };

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 border screen-only z-50">
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-sm">Call Sheet Tools</h3>
        
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-3 py-2 text-sm rounded hover:bg-secondary"
        >
          Print
        </button>
        
        <button
          onClick={exportPdf}
          disabled={pdfBusy}
          className="bg-green-500 text-white px-3 py-2 text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfBusy ? 'Exporting PDF...' : 'Export PDF'}
        </button>
        
        <button
          onClick={handleExportJSON}
          className="bg-blue-500 text-white px-3 py-2 text-sm rounded hover:bg-secondary"
        >
          Export JSON
        </button>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
            id="json-import"
          />
          <label
            htmlFor="json-import"
            className="bg-purple-500 text-white px-3 py-2 text-sm rounded hover:bg-purple-600 cursor-pointer inline-block text-center"
          >
            Import JSON
          </label>
        </div>
        
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-3 py-2 text-sm rounded hover:bg-red-600"
        >
          Reset
        </button>
        
        {pdfError && (
          <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
            PDF Error: {pdfError}
          </div>
        )}
      </div>
    </div>
  );
}
