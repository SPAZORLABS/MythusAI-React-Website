import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewScreenplayHeaderProps {
  screenplayId: string | null
  onToggleSidebar?: () => void
}

const NewScreenplayHeader: React.FC<NewScreenplayHeaderProps> = ({ screenplayId, onToggleSidebar }) => {
  return (
    <div className="border-b bg-secondary">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-3">
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
        </div>
            <div>
              <h1 className="text-3xl font-bold">New Screenplay Setup</h1>
              <p className="text-muted-foreground">
                Create a new screenplay with production details and script processing
              </p>
            </div>
          </div>
          
          {screenplayId && (
            <Badge variant="outline" className="text-sm">
              ID: {screenplayId}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewScreenplayHeader