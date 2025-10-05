import DailyProductionReport from '@/components/dailyProductionReport/DailyProductionReport';
import { DailyProductionReportProvider } from '@/contexts/DailyProductionReportContext';
import { useProductionInfo } from '@/contexts/ProductionInfoContext';
import { Screenplay } from '@/services/api/screenplayService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';

// Inner component that loads production info
const DailyProductionReportContent: React.FC<{ 
  selectedScreenplay: Screenplay;
  onToggleSidebar?: () => void;
  onFileManagerOpen?: () => void;
}> = ({ selectedScreenplay, onToggleSidebar, onFileManagerOpen }) => {
  const { loadProductionInfo } = useProductionInfo();
  const navigate = useNavigate();

  // Load production info when screenplay changes
  useEffect(() => {
    if (selectedScreenplay) {
      loadProductionInfo(selectedScreenplay.id);
    }
  }, [selectedScreenplay, loadProductionInfo]);

  const handleDailyProductionReportOpen = () => {
    navigate('/daily-production-report');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <PageHeader
        title="Daily Production Report"
        subtitle={selectedScreenplay.title || selectedScreenplay.filename}
        screenplayId={selectedScreenplay.id}
        screenplayTitle={selectedScreenplay.title || selectedScreenplay.filename}
        onToggleSidebar={onToggleSidebar}
        onFileManagerOpen={onFileManagerOpen}
        onDailyProductionReportOpen={handleDailyProductionReportOpen}
        onCallSheetOpen={() => navigate('/call-sheet')}
      />
      
      <div className="flex-1 overflow-auto">
        <DailyProductionReportProvider>
          <DailyProductionReport 
            selectedScreenplay={selectedScreenplay}
          />
        </DailyProductionReportProvider>
      </div>
    </div>
  );
};

const DailyProductionReportPage: React.FC<{ 
  selectedScreenplay: Screenplay | null;
  onToggleSidebar?: () => void;
  onFileManagerOpen?: () => void;
}> = ({ selectedScreenplay, onToggleSidebar, onFileManagerOpen }) => {
  if (!selectedScreenplay) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Screenplay Selected</h2>
          <p className="text-gray-600">Please select a screenplay from the sidebar to view the Daily Production Report.</p>
        </div>
      </div>
    );
  }

  return (
    <DailyProductionReportContent 
      selectedScreenplay={selectedScreenplay}
      onToggleSidebar={onToggleSidebar}
      onFileManagerOpen={onFileManagerOpen}
    />
  );
};

export default DailyProductionReportPage;