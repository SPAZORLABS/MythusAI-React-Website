import React from 'react';
import { Film, HelpCircle, Settings, Menu } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentProject } = useProject();
  
  return (
    <header className="bg-background border-b border-border h-16 flex items-center px-6 justify-between">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <Film className="h-3 w-3 text-primary" />
        <h1 className="text-xl font-bold text-foreground">MythusAI</h1>
      </div>
      
      <div className="flex-1 flex justify-center">
        {currentProject && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Current Project:</span>
            <span className="font-medium text-foreground">{currentProject.name}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-3 w-3 mr-2" />
          <span className="hidden sm:inline">Help</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-3 w-3 mr-2" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>
    </header>
  );
};

export default Header; 