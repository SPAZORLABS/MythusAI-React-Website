import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToastHelper } from '@/hooks/useToastHelper'
import { CheckCircle2, RefreshCw, Film, Loader2, Brain } from 'lucide-react'
import { agentsService } from '@/services/api/agents'
import { useNewScreenplayWorkflow } from '@/hooks/useNewScreenplayWorkflow'

const POLL_INTERVAL = 3000 // 3s

const CompleteStep = () => {
  const { state, hasProductionInfo, resetWorkflow } = useNewScreenplayWorkflow()
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summarizationComplete, setSummarizationComplete] = useState(false)
  const { showLoading, updateToast } = useToastHelper()

  // Consider setup complete once screenplay and title exist; scenes are
  // managed in ScenesContext and may not be mirrored here.
  const isComplete = !!state.screenplayId && !!state.title

  const startSummarization = useCallback(async () => {
    if (!state.screenplayId) return

    setIsSummarizing(true)
    setSummarizationComplete(false)

    const toastId = showLoading(
      'Processing Screenplay',
      'Generating AI summary and analysis...'
    )

    try {
      // Kick off summarization job
      await agentsService.summarizeScreenplay(state.screenplayId, false)

      // Poll until backend says complete
      let done = false
      while (!done) {
        const status = await agentsService.getSummaryStatus(state.screenplayId)
        if (status.hasExistingSummary) {
          done = true
          updateToast(toastId, {
            type: 'success',
            title: 'Screenplay Summary Complete',
            description: 'AI analysis has been generated successfully!'
          })
          setSummarizationComplete(true)
        } else {
          await new Promise(res => setTimeout(res, POLL_INTERVAL))
        }
      }
    } catch (error: any) {
      updateToast(toastId, {
        type: 'error',
        title: 'Summarization Failed',
        description: error.message || 'Failed to generate screenplay summary'
      })
    } finally {
      setIsSummarizing(false)
    }
  }, [state.screenplayId, showLoading, updateToast])

  // Auto start only once after setup complete
  useEffect(() => {
    if (state.showSuccess && state.screenplayId && !summarizationComplete) {
      startSummarization()
    }
  }, [state.showSuccess, state.screenplayId, summarizationComplete, startSummarization])

  return (
    <Card className="poppins-text bg-black text-white border border-border rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Step 4: Setup Complete
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isComplete ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-black border border-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              Screenplay Setup Complete!
            </h2>

            <p className="text-white mb-6 max-w-md mx-auto">
              Your screenplay "{state.title}" has been successfully created with all production information and scenes.
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-between p-3 bg-black border border-border rounded-lg">
                <span className="text-sm font-medium">Screenplay ID:</span>
                <Badge variant="outline" className="font-mono">
                  {state.screenplayId}
                </Badge>
              </div>

              {hasProductionInfo && (
                <div className="flex items-center justify-between p-3 bg-black border border-border rounded-lg">
                  <span className="text-sm font-medium">Production Info:</span>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-black border border-border rounded-lg">
                <span className="text-sm font-medium">AI Analysis:</span>
                {isSummarizing ? (
                  <Badge variant="outline" className="bg-blue-50">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing...
                  </Badge>
                ) : summarizationComplete ? (
                  <Badge variant="default" className="bg-green-600">
                    <Brain className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Brain className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 mt-8">
              <Button
                onClick={() => resetWorkflow()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Create Another
              </Button>

              {!summarizationComplete && !isSummarizing && (
                <Button
                  onClick={startSummarization}
                  variant="outline"
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Generate Summary
                </Button>
              )}

              <Button
                onClick={() => (window.location.href = '/dashboard')}
                className="gap-2"
              >
                <Film className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-black text-white">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-white">Completing setup...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CompleteStep
