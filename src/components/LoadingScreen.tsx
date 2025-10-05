// src/components/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import { Loader2, Server, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface LoadingScreenProps {
  onReady: () => void;
}

type Status = 'initializing' | 'starting-backend' | 'backend-ready' | 'checking-auth' | 'ready' | 'error';

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onReady }) => {
  const [status, setStatus] = useState<Status>('initializing');
  const [backendProgress, setBackendProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setStatus('starting-backend');
      
      // Listen for backend status updates
      (window as any).electron?.backend?.onStatus((backendStatus: any) => {
        console.log('Backend status:', backendStatus);
        
        if (backendStatus.status === 'starting') {
          setBackendProgress(backendStatus.progress || 0);
          setStatusMessage(backendStatus.message || 'Starting backend...');
        } else if (backendStatus.status === 'ready') {
          setStatus('backend-ready');
          setStatusMessage('Backend ready!');
          checkAuth();
        } else if (backendStatus.status === 'error') {
          setStatus('error');
          setErrorMessage(backendStatus.message || 'Backend failed to start');
        }
      });

      // Listen for backend errors
      (window as any).electron?.backend?.onError((error: string) => {
        setStatus('error');
        setErrorMessage(error);
      });

      // Check if backend is already ready
      const backendCheck = await (window as any).electron?.backend?.check();
      if (backendCheck?.ready) {
        setStatus('backend-ready');
        checkAuth();
      }
      
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('error');
      setErrorMessage('Failed to initialize app');
    }
  };

  const checkAuth = async () => {
    setStatus('checking-auth');
    setStatusMessage('Checking authentication...');
    
    try {
      const authResult = await (window as any).electron?.auth?.check();
      setAuthStatus(authResult);
      
      if (authResult?.isAuthenticated) {
        setStatus('ready');
        setStatusMessage('Welcome back!');
        setTimeout(() => onReady(), 500);
      } else {
        setStatus('ready');
        setStatusMessage('Please sign in to continue');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setStatus('ready');
    }
  };

  const handleLogin = () => {
    (window as any).electron?.auth?.login();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'backend-ready':
      case 'ready':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      default:
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md px-6">
        {/* App Logo/Name */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent">
            MythusAI
          </h1>
          <p className="">
            Screenplay Production Management
          </p>
        </div>

        {/* Status Message */}
        <div className="space-y-4">
          <p className="text-lg font-medium">
            {statusMessage}
          </p>

          {/* Progress Bar for Backend Startup */}
          {status === 'starting-backend' && (
            <div className="space-y-2">
              <Progress value={backendProgress} className="w-full h-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(backendProgress)}%
              </p>
            </div>
          )}

          {/* Backend Status Indicator */}
          {status !== 'error' && (
            <div className="flex items-center justify-center gap-2 text-sm ">
              <Server className="h-4 w-4" />
              <span>
                {status === 'backend-ready' || status === 'checking-auth' || status === 'ready'
                  ? 'Backend: Running'
                  : 'Backend: Starting...'}
              </span>
            </div>
          )}

          {/* Login Button */}
          {status === 'ready' && !authStatus?.isAuthenticated && (
            <div className="pt-4">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="w-full "
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Sign in with MythusAI
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This will open your browser to sign in securely
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mt-3 w-full"
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Version Info */}
        <p className="text-xs text-gray-400 dark:text-gray-600">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
