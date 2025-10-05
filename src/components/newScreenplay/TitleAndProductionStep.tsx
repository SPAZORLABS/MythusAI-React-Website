import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Film, 
  Settings, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Info
} from 'lucide-react'
import { Production_info } from '@/components/screenplay/Production_info'
import { ProductionInfo } from '@/types'
import { useNewScreenplayWorkflow } from '@/hooks/useNewScreenplayWorkflow'
import { screenplayService } from '@/services/api/screenplayService'
import { productionService } from '@/services/api/production'

const TitleAndProductionStep: React.FC = () => {
  const { 
    state, 
    setTitle, 
    createScreenplayWithProductionInfo,
    hasValidTitle,
    dispatch,
    hasProductionInfo,
    canProceedToUpload
  } = useNewScreenplayWorkflow()
  
  const [showProductionForm, setShowProductionForm] = useState(!!state.screenplayId)

  const handleTitleSubmit = async () => {
    if (!hasValidTitle) return

    try {
      // Immediately show production form so user can proceed
      setShowProductionForm(true)
      // Create screenplay first to get real ID
      const response = await screenplayService.createScreenplay(state.title.trim())
      
      if (response.success && response.screenplay_id) {
        // Set the real screenplay ID in state
        dispatch({ type: 'SET_SCREENPLAY_ID', payload: response.screenplay_id })
        dispatch({ type: 'SET_SUCCESS', payload: { field: 'title', message: 'Screenplay created! Now add production information.' } })
      } else {
        dispatch({ type: 'SET_ERROR', payload: { field: 'title', message: 'Failed to create screenplay' } })
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'title', message: error.message || 'Failed to create screenplay' } })
    }
  }

  // Sync production info from Production_info context into NewScreenplay context
  useEffect(() => {
    const syncProductionInfo = async () => {
      if (!state.screenplayId) return
      // Only fetch if we don't already have core production fields
      const hasCore = !!(state.productionInfo?.company_name || state.productionInfo?.director_name || state.productionInfo?.genre)
      if (hasCore) return
      try {
        const resp = await productionService.getProductionInfo(state.screenplayId)
        if (resp?.success && resp.data) {
          dispatch({ type: 'SET_PRODUCTION_INFO', payload: resp.data })
        }
      } catch (e) {
        // Non-blocking: continue without syncing
      }
    }
    syncProductionInfo()
  }, [state.screenplayId])

  const handleProductionInfoSave = async (productionInfo: ProductionInfo) => {
    // Use the existing createScreenplayWithProductionInfo which will create screenplay if missing
    const success = await createScreenplayWithProductionInfo(productionInfo)
    
    if (!success) {
      // Stay on this step if creation failed
      setShowProductionForm(true)
    }
    
    return success
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hasValidTitle) {
      handleTitleSubmit()
    }
  }

  const handleContinueToUpload = () => {
    // Move to Upload tab (step 2 -> tab 'upload')
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'upload' })
  }

  return (
    <div className="space-y-6">
      {/* Title Entry Section */}
      <Card className="poppins-text bg-black text-white border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Step 1: Screenplay Title & Production Information
          </CardTitle>
          <CardDescription>
            Enter your screenplay title and production details. Both are required to create your screenplay.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              Screenplay Title
              <span className="text-red-500 text-xs">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your screenplay title..."
              value={state.title}
              onChange={handleTitleChange}
              onKeyPress={handleTitleKeyPress}
              className="bg-black text-white border border-border rounded-md placeholder-gray-400"
              disabled={state.isCreatingScreenplay || !!state.screenplayId}
            />
            {state.errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {state.errors.title}
              </p>
            )}
            {state.success.title && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {state.success.title}
              </p>
            )}
          </div>
          
          {!showProductionForm && !state.screenplayId && (
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-white">
                <Info className="h-4 w-4" />
                <span>Production information will be requested next</span>
              </div>
              <Button
                onClick={handleTitleSubmit}
                disabled={!hasValidTitle}
                className="gap-2"
              >
                Continue to Production Info
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Info Section */}
      {(showProductionForm || state.screenplayId) && (
        <Card className="poppins-text bg-black text-white border border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Production Information
            </CardTitle>
            <CardDescription>
              Fill in the production details. The title will be automatically set to "{state.title}".
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.title && (
              <div className="mb-4 p-3 bg-black rounded-lg border border-blue-800">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    Title: {state.title}
                  </span>
                  {state.screenplayId && (
                    <Badge variant="outline" className="ml-auto">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Created
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {(showProductionForm || state.screenplayId) && (
              <Production_info
                screenplayId={state.screenplayId || 'temp-setup'}
                onSave={handleProductionInfoSave}
              />
            )}

            {/* Continue Action */}
            {state.screenplayId && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleContinueToUpload}
                  disabled={!canProceedToUpload}
                  className="gap-2"
                >
                  Continue to Upload
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Error/Success Messages */}
            {state.errors.productionInfo && (
              <Alert variant="destructive" className="mt-4 bg-black text-white border border-border">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.errors.productionInfo}</AlertDescription>
              </Alert>
            )}

            {state.success.productionInfo && (
              <Alert className="mt-4 bg-black text-white border border-border">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{state.success.productionInfo}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {state.isCreatingScreenplay && (
              <Alert className="mt-4 bg-black text-white border border-border">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Creating screenplay with production information...</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TitleAndProductionStep