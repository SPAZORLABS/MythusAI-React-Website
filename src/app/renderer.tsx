// src/app/renderer.tsx
import { useState, StrictMode } from 'react';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../components/theme/theme-provider';
import { ToastProvider } from '../components/ui/toast';
import { AuthProvider } from '../auth/AuthProvider';
import { ProductionInfoProvider } from '../contexts/ProductionInfoContext';
import { createRoot } from 'react-dom/client';
import { ProjectProvider } from '../contexts/ProjectContext';
import LoadingScreen from '../components/LoadingScreen';
import AppContent from './AppContent'; // Move your routes to a separate component
import './index.css';

const isFile = window.location.protocol === 'file:';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  // ✅ Show loading screen until ready
  if (!isReady) {
    return <LoadingScreen onReady={() => setIsReady(true)} />;
  }

  const Router = isFile ? HashRouter : BrowserRouter;

  // ✅ Show main app when ready
  return (
    <ProjectProvider>
      <ThemeProvider>
        <ToastProvider>
          <ProductionInfoProvider>
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </ProductionInfoProvider>
        </ToastProvider>
      </ThemeProvider>
    </ProjectProvider>
  );
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

let root = (container as any)._reactRoot;
if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
