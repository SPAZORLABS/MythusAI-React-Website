import React from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  TitleAndProductionStep,
  UploadScriptStep,
  ScenesReviewStep,
  CompleteStep,
  ProgressSteps,
  NewScreenplayHeader
} from '@/components/newScreenplay'
import { NewScreenplayProvider } from '@/contexts/NewScreenplayContext'
import { useNewScreenplayWorkflow } from '@/hooks/useNewScreenplayWorkflow'

interface NewScreenplayProps {
  className?: string
  onToggleSidebar?: () => void
}

const NewScreenplayContent = ({ className, onToggleSidebar }: NewScreenplayProps) => {
  const { state, setActiveTab } = useNewScreenplayWorkflow()

  const steps = [
    { id: 1, title: 'Title & Production Info', description: 'Enter title and production details' },
    { id: 2, title: 'Add Scenes', description: 'Process PDF or create scenes manually' },
    { id: 3, title: 'Review Scenes', description: 'Review and manage scenes' },
    { id: 4, title: 'Complete', description: 'Screenplay setup complete' }
  ]

  const navigateToStep = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className={cn("min-h-screen bg-black text-white", className)}>
      {/* Header */}
      <NewScreenplayHeader screenplayId={state.screenplayId} onToggleSidebar={onToggleSidebar} />
      
      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-6">
        <ProgressSteps steps={steps} currentStep={state.currentStep} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 poppins-text">
        <Tabs value={state.activeTab} onValueChange={navigateToStep} className="space-y-6">
          {/* Title & Production Info Tab */}
          <TabsContent value="title-production" className="space-y-6">
            <TitleAndProductionStep />
          </TabsContent>

          {/* Upload Script Tab */}
          <TabsContent value="upload" className="space-y-6">
            <UploadScriptStep />
          </TabsContent>

          {/* Scenes Review Tab */}
          <TabsContent value="scenes" className="space-y-6">
            <ScenesReviewStep />
          </TabsContent>

          {/* Complete Tab */}
          <TabsContent value="complete" className="space-y-6">
            <CompleteStep />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const NewScreenplay = (props: NewScreenplayProps) => {
  return (
    <NewScreenplayProvider>
      <NewScreenplayContent {...props} />
    </NewScreenplayProvider>
  )
}

export default NewScreenplay