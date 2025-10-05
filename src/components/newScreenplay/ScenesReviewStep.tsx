import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scissors, CheckCircle2 } from 'lucide-react'
import { ProductionInfoViewer } from '@/components/screenplay/ProductionInfoViewer'
import ScenesManager from '@/components/scenes/ScenesManager'
import { useNewScreenplayWorkflow } from '@/hooks/useNewScreenplayWorkflow'

const ScenesReviewStep: React.FC = () => {
  const { state, completeSetup } = useNewScreenplayWorkflow()
  return (
    <Card className="poppins-text bg-black text-white border border-border rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Step 3: Review and Manage Scenes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.screenplayId ? (
          <div className="space-y-6">
            {/* Production Info Summary */}
            {state.productionInfo && (
              <div className="p-4 bg-black rounded-lg border border-border">
                <h4 className="font-medium mb-3">Production Information</h4>
                <ProductionInfoViewer 
                  productionInfo={state.productionInfo}
                  showHeader={false}
                />
              </div>
            )}

            {/* Scenes Manager */}
            <div className="h-[800px] min-h-0 flex flex-col border border-border rounded-2xl bg-black text-white">
              <div className="flex-1 min-h-0 p-4 bg-black">
                <ScenesManager screenplayId={state.screenplayId} />
              </div>
            </div>

            {/* Complete Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={completeSetup}
                className="gap-2"
                size="lg"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete Screenplay Setup
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-black text-white">
            <p className="text-white">
              No screenplay created yet. Please complete the previous steps first.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ScenesReviewStep