import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  PlusCircle,
  FolderOpen,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
  projectCount: number;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ projectCount }) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Handle chat input submit (for now, just clear input)
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChatInput('');
    // TODO: Implement search or chat functionality
  };

  // Handle new menu actions
  const handleNewMenu = (action: 'upload' | 'create') => {
    setShowNewMenu(false);
    if (action === 'upload') {
      // Trigger file input
      document.getElementById('file-upload-input')?.click();
    } else if (action === 'create') {
      // setShowNewProjectModal(true); // This state was removed, so this line is removed
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload logic
      alert(`Selected file: ${file.name}`);
    }
  };

  return (
    <div className="min-h-full bg-background p-8 relative w-full">
      <div className="max-w-6xl mx-auto">
        {/* Logo and tagline */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Film className="h-3 w-3 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">MythusAI</h1>
          </div>
          <p className="text-xl text-muted-foreground">AI-powered Script Breakdown for Film Production</p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary/50"
            onClick={() => navigate('/script-upload')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <PlusCircle className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">New Project</h3>
              <p className="text-muted-foreground">Upload a script and start a new breakdown project</p>
            </CardContent>
          </Card>

          {projectCount > 0 && (
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary/50"
              onClick={() => navigate('/')}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <FolderOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Recent Projects</h3>
                <p className="text-muted-foreground">Open and continue working on existing projects</p>
              </CardContent>
            </Card>
          )}

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary/50"
            onClick={() => window.open('https://mythusai.com/docs', '_blank')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <p className="text-muted-foreground">Learn how to use MythusAI effectively</p>
            </CardContent>
          </Card>
        </div>

        {/* Features section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {/* Wand2 icon was removed, so this line is removed */}
                </div>
                <h4 className="font-semibold mb-2">AI-Powered Analysis</h4>
                <p className="text-sm text-muted-foreground">Extract characters, locations, and props automatically from your script</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {/* CheckSquare icon was removed, so this line is removed */}
                </div>
                <h4 className="font-semibold mb-2">Comprehensive Breakdown</h4>
                <p className="text-sm text-muted-foreground">Generate detailed scene breakdowns with all production elements</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Call Sheet Generator</h4>
                <p className="text-sm text-muted-foreground">Create professional call sheets for your production schedule</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Export Options</h4>
                <p className="text-sm text-muted-foreground">Export breakdowns and call sheets in PDF and Excel formats</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Version {(window as any).electron?.appInfo?.getVersion() || '1.0.0'}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-background z-50 flex items-end">
        <form
          onSubmit={handleChatSubmit}
          className="w-full z-50 flex items-end px-4 py-3 gap-2"
          style={{ boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.04)' }}
        >
          <button
            type="button"
            className="rounded-lg border border-input bg-muted px-4 py-2 mr-2 text-sm font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => setShowNewMenu((v) => !v)}
          >
            New
          </button>
          {showNewMenu && (
            <div className="absolute bottom-16 left-4 bg-popover border border-border rounded-lg shadow-lg z-50 w-48 animate-fade-in">
              <button
                className="w-full text-left px-4 py-2 hover:bg-accent rounded-t-lg"
                onClick={() => handleNewMenu('upload')}
                type="button"
              >
                Upload Script
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-accent rounded-b-lg"
                onClick={() => handleNewMenu('create')}
                type="button"
              >
                Create Script
              </button>
            </div>
          )}
          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.txt,.docx"
            className="hidden"
            onChange={handleFileUpload}
          />
          <textarea
            ref={chatInputRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Search projects, ask a question, or type a command..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition min-h-[44px] max-h-32 overflow-auto"
            style={{ fontFamily: 'inherit' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleChatSubmit(e as any);
              }
            }}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={!chatInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen; 