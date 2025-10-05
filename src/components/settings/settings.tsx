// Settings.tsx (use the same button, swap in the modal)
import React from 'react';
import { SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsModal from './SettingsModal';

const Settings: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        <SettingsIcon className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </>
  );
};

export default Settings;
