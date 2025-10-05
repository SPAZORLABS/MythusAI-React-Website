import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsSidebar from './SettingsSidebar';
import SettingsContent from './SettingsContent';
import { settingsSections } from './settingsConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div 
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
    onClick={(e) => e.target === e.currentTarget && onClose()}
    onKeyDown={(e) => e.key === 'Escape' && onClose()}
    role="dialog"
    aria-modal="true"
    tabIndex={-1}
    >
  <div className="bg-background border dark:border-neutral-900 rounded-lg shadow-lg w-[900px] h-[700px] flex flex-col max-w-[90vw] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border ">
          <div>
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground">Configure your application preferences</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden text-foreground">
          <SettingsSidebar 
            sections={settingsSections} 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <SettingsContent activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
