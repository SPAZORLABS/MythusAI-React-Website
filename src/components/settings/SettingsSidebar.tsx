import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SettingsSection } from './types';

interface SettingsSidebarProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  sections, 
  activeSection, 
  onSectionChange 
}) => {
  return (
    <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto">
      <nav className="p-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors mb-1 ${
              activeSection === section.id
                ? 'bg-background border border-border shadow-sm'
                : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-muted-foreground">{section.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium truncate">{section.title}</span>
                  {section.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
