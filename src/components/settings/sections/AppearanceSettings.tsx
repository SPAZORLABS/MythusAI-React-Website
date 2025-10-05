import React from 'react';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { Button } from '@/components/ui/button';

const ACCENT_COLORS = [
  '#3b82f6', 
  '#10b981', 
  '#f59e0b', 
  '#ef4444', 
  '#8b5cf6', 
  '#ec4899'
];

const AppearanceSettings: React.FC = () => {
  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h3 className="text-lg font-semibold mb-2">Appearance Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize the look and feel of the application.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Theme</label>
          <div className="mt-2">
            <ModeToggle />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Accent Color</label>
          <div className="flex space-x-2 mt-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300 transition-colors"
                style={{ backgroundColor: color }}
                aria-label={`Select ${color} accent color`}
              />
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Font Size</label>
          <div className="flex items-center space-x-2 mt-2">
            <Button variant="outline" size="sm">A-</Button>
            <span className="text-sm">Medium</span>
            <Button variant="outline" size="sm">A+</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
