// sections/GeneralSettings.tsx
import React from 'react';
import SettingItem from '../components/SettingItem';

const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">General Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure basic application behavior and preferences.
        </p>
      </div>
      
      <div className="space-y-4">
        <SettingItem
          label="Auto-save"
          description="Automatically save changes"
          value="Enabled"
        />
        
        <SettingItem
          label="Startup Behavior"
          description="What happens when the app starts"
          value="Show Dashboard"
        />
        
        <SettingItem
          label="Default Project"
          description="Default project to open"
          value="Select Project"
        />
      </div>
    </div>
  );
};

export default GeneralSettings;
