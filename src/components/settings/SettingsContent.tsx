import React from 'react';
import GeneralSettings from './sections/GeneralSettings';
import ProfileSettings from './sections/ProfileSettings';
import AIModelsSettings from './sections/AIModelsSettings';
import AppearanceSettings from './sections/AppearanceSettings';

interface SettingsContentProps {
  activeSection: string;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'ai-models':
        return <AIModelsSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a setting category</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {renderSection()}
    </div>
  );
};

export default SettingsContent;
