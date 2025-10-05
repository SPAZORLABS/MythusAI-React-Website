import React from 'react';
import { Button } from '@/components/ui/button';

interface SettingItemProps {
  label: string;
  description: string;
  value: string;
  onValueChange?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  label, 
  description, 
  value,
  onValueChange 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-foreground">{label}</label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onValueChange}>
        {value}
      </Button>
    </div>
  );
};

export default SettingItem;
