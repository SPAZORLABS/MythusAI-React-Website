import React from 'react'
import { Screenplay } from '@/services/api/screenplayService'
import ScenesManager from '@/components/scenes/ScenesManager'

const Script: React.FC<{ 
  selectedScreenplay: Screenplay | null, 
  onToggleSidebar?: () => void,
  onFileManagerOpen?: () => void 
}> = ({ selectedScreenplay, onToggleSidebar, onFileManagerOpen }) => {
    console.log('Script component rendered with selectedScreenplay:', selectedScreenplay);
    
    if (!selectedScreenplay) {
        console.log('No screenplay selected, redirecting to dashboard');
        window.location.href = '/dashboard';
        return null;
    }

    console.log('Rendering ScenesManager with screenplay:', selectedScreenplay);
    console.log('Screenplay title:', selectedScreenplay.title);
    console.log('Screenplay filename:', selectedScreenplay.filename);
    const displayTitle = selectedScreenplay.title || selectedScreenplay.filename || 'Untitled Screenplay';
    console.log('Display title:', displayTitle);
    return (
        <div className="h-full">
            <ScenesManager
                screenplayId={selectedScreenplay.id}
                screenplayTitle={displayTitle}
                onToggleSidebar={onToggleSidebar}
                onFileManagerOpen={onFileManagerOpen}
            />
        </div>
    );
};

export default Script   