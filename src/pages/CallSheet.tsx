import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CallSheetProvider } from '@/contexts/CallSheetContext';
import { CallSheetRoot } from '@/components/callSheet/CallSheetRoot';
import { Toolbar } from '@/components/callSheet/Toolbar';
import { useCallSheetEditor } from '@/hooks/useCallSheet';
import { useProductionInfo } from '@/contexts/ProductionInfoContext';
import { Screenplay } from '@/services/api/screenplayService';
import PageHeader from '@/components/layout/PageHeader';
import { ScenesProvider } from '@/contexts/ScenesContext';

// Inner component that uses the hooks
const CallSheetContent: React.FC<{ 
  selectedScreenplay?: Screenplay | null;
  onToggleSidebar?: () => void;
  onFileManagerOpen?: () => void;
}> = ({ selectedScreenplay, onToggleSidebar, onFileManagerOpen }) => {
  const callSheetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { loadProductionInfo } = useProductionInfo();
  
  // Load production info when screenplay changes
  useEffect(() => {
    if (selectedScreenplay) {
      loadProductionInfo(selectedScreenplay.id);
    }
  }, [selectedScreenplay, loadProductionInfo]);
  
  // Use the call sheet editor hook for autofill
  useCallSheetEditor();

  const handleDailyProductionReportOpen = () => {
    navigate('/daily-production-report');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <PageHeader
        title="Call Sheet"
        subtitle={selectedScreenplay?.title || selectedScreenplay?.filename || 'No screenplay selected'}
        screenplayId={selectedScreenplay?.id}
        screenplayTitle={selectedScreenplay?.title || selectedScreenplay?.filename}
        onToggleSidebar={onToggleSidebar}
        onFileManagerOpen={onFileManagerOpen}
        onDailyProductionReportOpen={handleDailyProductionReportOpen}
        onCallSheetOpen={() => navigate('/call-sheet')}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="relative min-h-full">
          <Toolbar callSheetRef={callSheetRef} />
          <div className="p-4">
            <CallSheetRoot ref={callSheetRef} screenplay_id={selectedScreenplay?.id || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CallSheetPageProps {
  selectedScreenplay?: Screenplay | null;
  onToggleSidebar?: () => void;
  onFileManagerOpen?: () => void;
}

export default function CallSheetPage({ 
  selectedScreenplay, 
  onToggleSidebar, 
  onFileManagerOpen 
}: CallSheetPageProps) {
  console.log('CallSheetPage props:', { selectedScreenplay, onToggleSidebar, onFileManagerOpen });
  return (
    <ScenesProvider screenplayId={selectedScreenplay?.id || ''}>
      <CallSheetProvider>
        <CallSheetContent 
          selectedScreenplay={selectedScreenplay}
          onToggleSidebar={onToggleSidebar}
          onFileManagerOpen={onFileManagerOpen}
        />
      </CallSheetProvider>
    </ScenesProvider>
  );
}
