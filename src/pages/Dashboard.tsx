import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  FolderOpen, 
  Send, 
  Plus, 
  Loader2, 
  AlertCircle,
  X,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import ChatInterface from '@/components/dashboard/ChatInterface';
import ScreenplayList from '@/components/dashboard/ScreenplayList';
import { screenplayService, Screenplay } from '@/services/api/screenplayService';

interface DashboardProps {
  selectedScreenplay?: Screenplay | null;
  onToggleSidebar?: () => void;
  onScreenplaySelect?: (screenplay: Screenplay) => void;
  onFileManagerOpen?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  selectedScreenplay, 
  onToggleSidebar,
  onScreenplaySelect,
  onFileManagerOpen
}) => {
  const navigate = useNavigate();
  
  // State management
  const [screenplays, setScreenplays] = useState<Screenplay[]>([]);
  const [screenplaysLoading, setScreenplaysLoading] = useState(true);
  const [screenplaysError, setScreenplaysError] = useState<string | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Refs
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Load screenplays on component mount
  useEffect(() => {
    loadScreenplays();
  }, []);

  const loadScreenplays = async () => {
    try {
      setScreenplaysLoading(true);
      setScreenplaysError(null);
      const data = await screenplayService.getAllScreenplays();
      setScreenplays(data);
    } catch (error) {
      console.error('Failed to load screenplays:', error);
      setScreenplaysError('Failed to load screenplays. Please try again.');
    } finally {
      setScreenplaysLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      setIsCreatingProject(true);
      
      // Create screenplay using the service
      await screenplayService.createScreenplay({
        title: newProjectName.trim(),
        description: newProjectDescription.trim()
      });
      
      // Refresh screenplays list
      await loadScreenplays();
      
      // Reset form and close modal
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleChatFocus = () => {
    setIsChatMode(true);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Open full chat interface
    setIsChatMode(true);
    setChatInput('');
  };

  const handleSettings = () => {
    // Navigate to settings page or open settings modal
    console.log('Opening settings...');
    // TODO: Implement settings navigation
  };

  const handleFileManagement = () => {
    // Trigger file manager open from parent component
    if (onFileManagerOpen) {
      onFileManagerOpen();
    } else {
      console.log('File manager not available');
    }
  };

  const handleScreenplaySelectInternal = (screenplayId: string) => {
    // Find the selected screenplay
    const screenplay = screenplays.find(s => s.id === screenplayId);
    if (screenplay) {
      console.log('Selected screenplay:', screenplay);
      // Use parent callback if available, otherwise navigate directly
      if (onScreenplaySelect) {
        onScreenplaySelect(screenplay);
      } else {
        navigate('/screenplay/script', { state: { screenplay } });
      }
    }
  };

  // Loading state
  if (screenplaysLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your screenplays...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (screenplaysError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{screenplaysError}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Chat Interface Overlay */}
      <AnimatePresence>
        {isChatMode && (
          <ChatInterface onClose={() => setIsChatMode(false)} />
        )}
      </AnimatePresence>

      {/* Main Dashboard Content */}
      <AnimatePresence>
        {!isChatMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 py-8 max-w-6xl"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  MythusAI
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your AI-powered screenplay companion
                </p>
              </div>
              
              {/* Sidebar Toggle Button */}
              {onToggleSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSidebar}
                  className="ml-4"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </motion.div>

            {/* Feature Access Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleFileManagement}
                className="flex items-center gap-2 h-12 px-6"
              >
                <FolderOpen className="h-5 w-5" />
                Files
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleSettings}
                className="flex items-center gap-2 h-12 px-6"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Button>
              
              <Button
                size="lg"
                onClick={() => window.location.href = '/new'}
                className="flex items-center gap-2 h-12 px-6"
              >
                <Plus className="h-5 w-5" />
                New Screenplay
              </Button>
            </motion.div>

            {/* Chat Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <form onSubmit={handleChatSubmit} className="relative">
                <Textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={handleChatFocus}
                  placeholder="Ask me anything about your screenplay..."
                  className="min-h-[60px] pr-12 resize-none text-base"
                  rows={2}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  disabled={!chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>

            {/* Screenplay List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ScreenplayList
              screenplays={screenplays}
              onScreenplaySelect={handleScreenplaySelectInternal}
            />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
