import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">Profile Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your user profile and account information.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <Button variant="outline" size="sm">Change Avatar</Button>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">First Name</label>
            <input 
              type="text" 
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
              placeholder="Enter first name"
              defaultValue={user?.username?.split(' ')[0] || ''}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Last Name</label>
            <input 
              type="text" 
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
              placeholder="Enter last name"
              defaultValue={user?.username?.split(' ').slice(1).join(' ') || ''}
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="flex items-center space-x-2 mt-1">
            <input 
              type="email" 
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
              placeholder="Enter email address"
              value={user?.email || ''}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
