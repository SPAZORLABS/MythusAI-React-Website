import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams, useLocation } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import ScreenplaySidebar from '../components/sidebar/ScreenplaySidebar';
import Dashboard from '../pages/Dashboard';
import Script from '../pages/Script';
import DailyProductionReportPage from '../pages/DailyProductionReport';
import CallSheetPage from '../pages/CallSheet';
import ProductionInfoPage from '../pages/ProductionInfo';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import MasterBreakdownPage from '../pages/MasterBreakdown';
import FileManager from '../components/files/FileManager';
import NewScreenplay from '../pages/NewScreenplay';
import { Screenplay } from '../services/api/screenplayService';
import { useElectronAuth } from '@/hooks/useElectronAuth';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useElectronAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuListeners, setMenuListeners] = useState(false);
  const [selectedScreenplay, setSelectedScreenplay] = useState<Screenplay | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  // Set up IPC menu event listeners
  useEffect(() => {
    if (menuListeners) return;

    const setupMenuListeners = () => {
      if (!(window as any).electron?.ipc) return;

      (window as any).electron.ipc.receive('menu-new-project', () => {
        navigate('/');
      });

      (window as any).electron.ipc.receive('menu-upload-script', () => {
        if (selectedScreenplay) {
          navigate('/screenplay/script');
        } else {
          console.log('No screenplay selected. Please select a screenplay first.');
          navigate('/');
        }
      });
    };

    setupMenuListeners();
    setMenuListeners(true);
  }, [menuListeners, navigate, selectedScreenplay]);

  // Fix file:// URL routing issues
  useEffect(() => {
    // If we're on a file path (like /C:/), redirect to root
    if (location.pathname.includes(':/') || location.pathname.includes('\\')) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background relative">
      
      {/* Sidebar */}
      {location.pathname !== '/login' && 
       location.pathname !== '/signup' && 
       location.pathname !== '/email-verification' && 
       sidebarVisible && (
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
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="h-full overflow-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/email-verification" element={
            <ProtectedRoute>
              <EmailVerificationPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard
                selectedScreenplay={selectedScreenplay}
                onToggleSidebar={handleToggleSidebar}
                onScreenplaySelect={handleScreenplaySelect}
                onFileManagerOpen={handleFileManagerOpen}
              />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard
                selectedScreenplay={selectedScreenplay}
                onToggleSidebar={handleToggleSidebar}
                onScreenplaySelect={handleScreenplaySelect}
                onFileManagerOpen={handleFileManagerOpen}
              />
            </ProtectedRoute>
          } />
          <Route path="/screenplay/daily-production-report" element={
            <ProtectedRoute>
              <DailyProductionReportPage
                selectedScreenplay={selectedScreenplay}
                onToggleSidebar={handleToggleSidebar}
                onFileManagerOpen={handleFileManagerOpen}
              />
            </ProtectedRoute>
          } />
          <Route path="/screenplay/call-sheet" element={
            <ProtectedRoute>
              <CallSheetPage
                selectedScreenplay={selectedScreenplay}
                onToggleSidebar={handleToggleSidebar}
                onFileManagerOpen={handleFileManagerOpen}
              />
            </ProtectedRoute>
          } />
          <Route path="/screenplay/script" element={
            <ProtectedRoute>
              <Script
                selectedScreenplay={selectedScreenplay}
                onToggleSidebar={handleToggleSidebar}
                onFileManagerOpen={handleFileManagerOpen}
              />
            </ProtectedRoute>
          } />
          <Route path="/screenplay/production-info/:screenplayId" element={
            <ProtectedRoute>
              <ProductionInfoPage />
            </ProtectedRoute>
          } />
          <Route path="/screenplay/master-breakdown/:sceneId?" element={
            <ProtectedRoute>
              <MasterBreakdownPage
                selectedScreenplay={selectedScreenplay}
                onToggleSidebar={handleToggleSidebar}
                onFileManagerOpen={handleFileManagerOpen}
              />
            </ProtectedRoute>
          } />

          {/* Legacy routes */}
          <Route path="/daily-production-report" element={<Navigate to="/screenplay/daily-production-report" replace />} />
          <Route path="/call-sheet" element={<Navigate to="/screenplay/call-sheet" replace />} />
          <Route path="/script" element={<Navigate to="/screenplay/script" replace />} />
          <Route path="/production-info/:screenplayId" element={<ProductionInfoRedirect />} />
          <Route path="/new" element={
            <ProtectedRoute>
              <NewScreenplay onToggleSidebar={handleToggleSidebar} />
            </ProtectedRoute>
          } />
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
      </main>
    </div>
  );
};

export default AppContent;
