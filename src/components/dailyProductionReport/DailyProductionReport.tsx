// components/DailyProductionReport.tsx
import { useState, useRef, useEffect } from 'react';
import { Printer, Plus, Trash2, ArrowLeft, CalendarIcon, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Screenplay } from '@/services/api/screenplayService';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useDailyProductionReportEditor } from '@/hooks/useDailyProductionReport';
import { useProductionInfoState } from '@/hooks/useProductionInfo';

interface DailyProductionReportProps {
  selectedScreenplay?: Screenplay | null;
  selectedScene?: any;
}

const DailyProductionReport: React.FC<DailyProductionReportProps> = ({ 
  selectedScreenplay, 
  selectedScene 
}) => {
  // Use the new context and hooks
  const {
    data: formData,
    isLoading,
    error,
    updateField,
    updateCharacterField,
    addCharacter,
    removeCharacter
  } = useDailyProductionReportEditor(selectedScreenplay, selectedScene);

  const { productionInfo } = useProductionInfoState();
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // PDF Export hook - ✅ Fixed to match Call Sheet pattern
  const { exportPdf, busy: pdfBusy, error: pdfError } = usePdfExport({
    targetRef: reportRef,
    filename: `daily-production-report-${formData.shootDate || 'date'}-scene-${formData.sceneNumber || 'N'}.pdf`,
    orientation: 'landscape',
    format: 'a4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    scale: 2,
    excludeSelectors: [
      '.screen-only',
      'button',
      '[data-no-print]'
    ]
  });

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // ✅ Enhanced print function matching Call Sheet pattern
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

  const handleBack = () => {
    window.history.back();
  };

  // ✅ Simplified PDF export function
  const handleExportPDF = async () => {
    try {
      await exportPdf();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      updateField('shootDate', format(selectedDate, 'dd-MM-yyyy'));
      updateField('dayNumber', selectedDate.getDate().toString());
      setOpen(false);
    }
  };

  const handleDateClick = () => {
    if (!open) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // ✅ Common input class with forced black text
  const inputClassName = "w-full border-none outline-none bg-transparent text-black placeholder-gray-400";
  const smallInputClassName = "border-none outline-none bg-transparent text-black placeholder-gray-400";

  return (
    <div className="h-full p-4 w-full">
      <div className="mx-auto mb-4 screen-only">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            {selectedScene && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <span className="text-sm font-medium">Selected Scene:</span>
                <span className="text-sm font-bold">{selectedScene.scene_number}</span>
                <span className="text-xs text-blue-600">- {selectedScene.header}</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Loading data...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200">
                <span className="text-sm font-medium">Error: {error}</span>
              </div>
            )}
            {pdfError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200">
                <span className="text-sm font-medium">PDF Export Error: {pdfError}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfBusy}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfBusy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Exporting PDF...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Production Info Summary - ✅ Added screen-only class */}
      {productionInfo && (
        <div className="mx-auto mb-4 screen-only max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Production Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {productionInfo.company_name && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Company:</span>
                  <p className="text-gray-800 dark:text-gray-200">{productionInfo.company_name}</p>
                </div>
              )}
              {productionInfo.director_name && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Director:</span>
                  <p className="text-gray-800 dark:text-gray-200">{productionInfo.director_name}</p>
                </div>
              )}
              {productionInfo.producer_names && productionInfo.producer_names.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Producer(s):</span>
                  <p className="text-gray-800 dark:text-gray-200">{productionInfo.producer_names.join(', ')}</p>
                </div>
              )}
              {productionInfo.line_producer_name && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Line Producer:</span>
                  <p className="text-gray-800 dark:text-gray-200">{productionInfo.line_producer_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* A4 Container - ✅ Maintain white background and black text for print */}
      <div 
        ref={reportRef}
        className="max-w-6xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:mx-0 font-mono text-xs text-black" 
        style={{ aspectRatio: '297/210', minHeight: '210mm' }}
      >
        
        {/* Form Content - ✅ All content uses black text */}
        <div className="w-full h-full p-6 print:p-4 text-sm text-black">
          
          {/* Header */}
          <div className="border-2 border-black">
            <div className="text-center py-4 border-b border-black">
              <h1 className="text-lg font-bold text-black">DAILY PRODUCTION REPORT</h1>
              <h2 className="text-base font-bold text-black">PRODUCTION HOUSE</h2>
            </div>

            {/* Shoot Location Row */}
            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">
                  Shoot Location
                </div>
                <div className="flex-1 p-2">
                  <input
                    type="text"
                    value={formData.shootLocation || ''}
                    onChange={(e) => updateField('shootLocation', e.target.value)}
                    className={inputClassName}
                    placeholder="Enter shoot location"
                  />
                </div>
              </div>
            </div>

            {/* Shoot Date Row */}
            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">
                  Shoot Date
                </div>
                <div className="flex-1 p-2 text-center">
                  {/* ✅ Screen-only date picker */}
                  <div className="screen-only relative flex items-center justify-center">
                    <Button
                      variant="outline"
                      className="relative w-32 justify-start font-normal border border-gray-300 bg-white hover:bg-gray-50 p-2 h-8 text-black"
                      onClick={handleDateClick}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-black" />
                      {date ? format(date, 'dd-MM-yyyy') : "Select date"}
                    </Button>
                    
                    {open && (
                      <div className="absolute top-0 mt-10 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4" ref={datePickerRef}>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelect}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                  <div className="print-only text-black">
                    {formData.shootDate || "XX-XX-XXXX"}
                  </div>
                  <div className="text-xs mt-1 text-black">
                    {formData.shootDate || "XX-XX-XXXX"}
                  </div>
                </div>
              </div>
            </div>

            {/* Scene Number and Status Row */}
            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">
                  Scene Number: 
                  <input
                    type="text"
                    value={formData.sceneNumber || ''}
                    onChange={(e) => updateField('sceneNumber', e.target.value)}
                    className="w-8 ml-1 border-none outline-none bg-transparent text-black placeholder-gray-400"
                  />
                  {/* ✅ Screen-only scene info */}
                  {selectedScene && (
                    <span className="ml-2 text-xs text-blue-600 font-normal screen-only">
                      ✓ {selectedScene.header || 'Scene selected'}
                    </span>
                  )}
                  {isLoading && (
                    <span className="ml-2 text-xs text-gray-500 font-normal screen-only">
                      <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                      Loading scene details...
                    </span>
                  )}
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">
                  Completed: 
                  <select
                    value={formData.completed || 'Yes'}
                    onChange={(e) => updateField('completed', e.target.value)}
                    className="ml-1 border-none outline-none bg-transparent text-black"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">
                  Part Completed: 
                  <select
                    value={formData.partCompleted || 'Yes'}
                    onChange={(e) => updateField('partCompleted', e.target.value)}
                    className="ml-1 border-none outline-none bg-transparent text-black"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="w-1/4 p-2 font-semibold bg-gray-50 text-black">
                  To Pick Up: 
                  <select
                    value={formData.toPickUp || 'Yes'}
                    onChange={(e) => updateField('toPickUp', e.target.value)}
                    className="ml-1 border-none outline-none bg-transparent text-black"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time Schedule Rows */}
            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Call/Shoot Time</div>
                <div className="w-1/4 border-r border-black p-2">
                  <input
                    type="text"
                    value={formData.callShootTime || ''}
                    onChange={(e) => updateField('callShootTime', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Breakfast on Location</div>
                <div className="w-1/4 p-2">
                  <input
                    type="text"
                    value={formData.breakfastOnLocation || ''}
                    onChange={(e) => updateField('breakfastOnLocation', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">First Shot</div>
                <div className="w-1/4 border-r border-black p-2">
                  <input
                    type="text"
                    value={formData.firstShot || ''}
                    onChange={(e) => updateField('firstShot', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Lunch Break</div>
                <div className="w-1/4 p-2">
                  <input
                    type="text"
                    value={formData.lunchBreak || ''}
                    onChange={(e) => updateField('lunchBreak', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">1st Shot Post Lunch</div>
                <div className="w-1/4 border-r border-black p-2">
                  <input
                    type="text"
                    value={formData.firstShotPostLunch || ''}
                    onChange={(e) => updateField('firstShotPostLunch', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Evening Snacks</div>
                <div className="w-1/4 p-2">
                  <input
                    type="text"
                    value={formData.eveningSnacks || ''}
                    onChange={(e) => updateField('eveningSnacks', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Wrap</div>
                <div className="w-1/4 border-r border-black p-2">
                  <input
                    type="text"
                    value={formData.wrap || ''}
                    onChange={(e) => updateField('wrap', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Number of Setups</div>
                <div className="w-1/4 p-2">
                  <input
                    type="text"
                    value={formData.numberOfSetups || ''}
                    onChange={(e) => updateField('numberOfSetups', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Total Hours</div>
                <div className="w-1/4 border-r border-black p-2">
                  <input
                    type="text"
                    value={formData.totalHours || ''}
                    onChange={(e) => updateField('totalHours', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">Extra Add. Equipment</div>
                <div className="w-1/4 p-2">
                  <input
                    type="text"
                    value={formData.extraAddEquipment || ''}
                    onChange={(e) => updateField('extraAddEquipment', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            {/* Juniors and Wrap Time Row */}
            <div className="border-b border-black">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold bg-gray-50 text-black">
                  Juniors Requirement - 
                  <input
                    type="text"
                    value={formData.juniorsRequirement || ''}
                    onChange={(e) => updateField('juniorsRequirement', e.target.value)}
                    className="w-6 border-none outline-none bg-transparent text-black placeholder-gray-400"
                  />
                </div>
                <div className="w-1/4 border-r border-black p-2 text-black">
                  Actual Count: 
                  <input
                    type="text"
                    value={formData.actualCount || ''}
                    onChange={(e) => updateField('actualCount', e.target.value)}
                    className="w-16 ml-1 border-none outline-none bg-transparent text-black placeholder-gray-400"
                  />
                </div>
                <div className="w-1/2 p-2 text-black">
                  Wrap Time: 
                  <input
                    type="text"
                    value={formData.wrapTime || ''}
                    onChange={(e) => updateField('wrapTime', e.target.value)}
                    className="w-20 ml-1 border-none outline-none bg-transparent text-black placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Characters Header */}
            <div className="border-b border-black bg-gray-50">
              <div className="flex">
                <div className="w-1/4 border-r border-black p-2 font-semibold text-black">Characters</div>
                <div className="w-1/4 border-r border-black p-2 font-semibold text-center text-black">Cast Name</div>
                <div className="w-1/4 border-r border-black p-2 font-semibold text-center text-black">Call Time</div>
                <div className="w-1/4 p-2 font-semibold text-center text-black">Report Time</div>
              </div>
            </div>

            {/* Characters Rows */}
            {formData.characters.map((char, index) => (
              <div key={index} className="border-b border-black">
                <div className="flex">
                  <div className="w-1/4 border-r border-black p-2">
                    <input
                      type="text"
                      value={char.character || ''}
                      onChange={(e) => updateCharacterField(index, 'character', e.target.value)}
                      className={inputClassName}
                      placeholder="Character name"
                    />
                  </div>
                  <div className="w-1/4 border-r border-black p-2">
                    <input
                      type="text"
                      value={char.castName || ''}
                      onChange={(e) => updateCharacterField(index, 'castName', e.target.value)}
                      className={inputClassName}
                      placeholder="Cast name"
                    />
                  </div>
                  <div className="w-1/4 border-r border-black p-2">
                    <input
                      type="text"
                      value={char.callTime || ''}
                      onChange={(e) => updateCharacterField(index, 'callTime', e.target.value)}
                      className={inputClassName}
                      placeholder="Call time"
                    />
                  </div>
                  <div className="w-1/4 p-2 flex items-center justify-between">
                    <input
                      type="text"
                      value={char.reportTime || ''}
                      onChange={(e) => updateCharacterField(index, 'reportTime', e.target.value)}
                      className="flex-1 border-none outline-none bg-transparent text-black placeholder-gray-400"
                      placeholder="Report time"
                    />
                    {/* ✅ Screen-only controls */}
                    <div className="screen-only ml-2">
                      {index === formData.characters.length - 1 && (
                        <button
                          onClick={addCharacter}
                          className="text-green-600 hover:text-green-800 mr-1"
                          title="Add row"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                      {formData.characters.length > 1 && (
                        <button
                          onClick={() => removeCharacter(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove row"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="mt-4 border-2 border-black">
            <div className="border-b border-black p-2 font-semibold bg-gray-50 text-black">Notes:</div>
            <div className="p-2 h-10">
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full h-16 border-none outline-none bg-transparent resize-none text-black placeholder-gray-400"
                placeholder="Enter notes here..."
              />
            </div>
          </div>

          {/* Approval Section */}
          <div className="mt-4 border-2 border-black">
            <div className="border-b border-black p-2 font-semibold bg-gray-50 text-black">Approved by:</div>
            <div className="mt-6 flex justify-between">
              <div className="w-1/2 pr-4">
                <div className="border-b border-black pb-1 mb-1">
                  <input
                    type="text"
                    value={formData.firstAD || ''}
                    onChange={(e) => updateField('firstAD', e.target.value)}
                    className={inputClassName}
                    placeholder="Name"
                  />
                </div>
                <div className="font-semibold text-black">1st AD:</div>
              </div>
              <div className="w-1/2 pl-4">
                <div className="border-b border-black pb-1 mb-1">
                  <input
                    type="text"
                    value={formData.productionHOD || ''}
                    onChange={(e) => updateField('productionHOD', e.target.value)}
                    className={inputClassName}
                    placeholder="Name"
                  />
                </div>
                <div className="font-semibold text-black">Production HOD:</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProductionReport;
