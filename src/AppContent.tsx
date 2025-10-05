import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import ScreenplaySidebar from './components/sidebar/ScreenplaySidebar';
import Dashboard from './pages/Dashboard';
import Script from './pages/Script';
import DailyProductionReportPage from './pages/DailyProductionReport';
import CallSheetPage from './pages/CallSheet';
import ProductionInfoPage from './pages/ProductionInfo';
import MasterBreakdownPage from './pages/MasterBreakdown';
import LoginPage from './pages/LoginPage';
import FileManager from './components/files/FileManager';
import NewScreenplay from './pages/NewScreenplay';
import { Screenplay } from './services/api/screenplayService';
import SettingsModal from '@/components/settings/SettingsModal';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScreenplay, setSelectedScreenplay] = useState<Screenplay | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleScreenplaySelect = (screenplay: Screenplay) => {
    setSelectedScreenplay(screenplay);
    setSidebarVisible(false);
    navigate('/screenplay/script');
  };

  const handleFileManagerOpen = () => {
    setShowFileManager(true);
  };

  const ProductionInfoRedirect = () => {
    const { screenplayId } = useParams();
    return <Navigate to={`/screenplay/production-info/${screenplayId}`} replace />;
  };

  return (
    <div className="h-screen bg-background relative">
      
      {/* Sidebar */}
      {sidebarVisible && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={handleToggleSidebar}
          />
          <div className="fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out animate-in slide-in-from-left">
            <ScreenplaySidebar
              onScreenplaySelect={handleScreenplaySelect}
              selectedScreenplayId={selectedScreenplay?.id}
              onToggleCollapse={handleToggleSidebar}
              onFileManagerOpen={handleFileManagerOpen}
              onSidebarClose={() => setSidebarVisible(false)}
              onSettingsOpen={() => setSettingsOpen(!settingsOpen)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="h-full overflow-auto">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <Dashboard
              selectedScreenplay={selectedScreenplay}
              onToggleSidebar={handleToggleSidebar}
              onScreenplaySelect={handleScreenplaySelect}
              onFileManagerOpen={handleFileManagerOpen}
              onSettingsOpen={() => setSettingsOpen(!settingsOpen)}
            />
          } />
          <Route path="/dashboard" element={
            <Dashboard
              selectedScreenplay={selectedScreenplay}
              onToggleSidebar={handleToggleSidebar}
              onScreenplaySelect={handleScreenplaySelect}
              onFileManagerOpen={handleFileManagerOpen}
            />
          } />
          <Route path="/screenplay/daily-production-report" element={
            <DailyProductionReportPage
              selectedScreenplay={selectedScreenplay}
              onToggleSidebar={handleToggleSidebar}
              onFileManagerOpen={handleFileManagerOpen}
            />
          } />
          <Route path="/screenplay/call-sheet" element={
            <CallSheetPage
              selectedScreenplay={selectedScreenplay}
              onToggleSidebar={handleToggleSidebar}
              onFileManagerOpen={handleFileManagerOpen}
            />
          } />
          <Route path="/screenplay/script" element={
            <Script
              selectedScreenplay={selectedScreenplay}
              onToggleSidebar={handleToggleSidebar}
              onFileManagerOpen={handleFileManagerOpen}
            />
          } />
          <Route path="/screenplay/production-info/:screenplayId" element={<ProductionInfoPage />} />
          <Route path="/screenplay/master-breakdown/:sceneId?" element={
            <MasterBreakdownPage
              selectedScreenplay={selectedScreenplay}
              onToggleSidebar={handleToggleSidebar}
              onFileManagerOpen={handleFileManagerOpen}
            />
          } />

          {/* Legacy routes */}
          <Route path="/daily-production-report" element={<Navigate to="/screenplay/daily-production-report" replace />} />
          <Route path="/call-sheet" element={<Navigate to="/screenplay/call-sheet" replace />} />
          <Route path="/script" element={<Navigate to="/screenplay/script" replace />} />
          <Route path="/production-info/:screenplayId" element={<ProductionInfoRedirect />} />
          <Route path="/new" element={<NewScreenplay onToggleSidebar={handleToggleSidebar} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* File Manager */}
        {showFileManager && (
          <FileManager
            trigger={null}
            isOpen={showFileManager}
            onOpenChange={setShowFileManager}
          />
        )}
        {settingsOpen && (
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}>
            {/* your settings content */}
          </SettingsModal>
        )}
      </main>
    </div>
  );
};

export default AppContent;
