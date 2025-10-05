import React, { useState } from 'react'
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

const TitleAndProductionStep: React.FC = () => {
  const { 
    state, 
    setTitle, 
    createScreenplayWithProductionInfo,
    hasValidTitle,
    dispatch 
  } = useNewScreenplayWorkflow()
  
  const [showProductionForm, setShowProductionForm] = useState(!!state.screenplayId)

  const handleTitleSubmit = async () => {
    if (!hasValidTitle) return

    try {
      // Create screenplay first to get real ID
      const response = await screenplayService.createScreenplay(state.title.trim())
      
      if (response.success && response.screenplay_id) {
        // Set the real screenplay ID in state
        dispatch({ type: 'SET_SCREENPLAY_ID', payload: response.screenplay_id })
        setShowProductionForm(true)
        dispatch({ type: 'SET_SUCCESS', payload: { field: 'title', message: 'Screenplay created! Now add production information.' } })
      } else {
        dispatch({ type: 'SET_ERROR', payload: { field: 'title', message: 'Failed to create screenplay' } })
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'title', message: error.message || 'Failed to create screenplay' } })
    }
  }

  const handleProductionInfoSave = async (productionInfo: ProductionInfo) => {
    if (!state.screenplayId) {
      dispatch({ type: 'SET_ERROR', payload: { field: 'productionInfo', message: 'No screenplay ID found' } })
      return false
    }

    // Use the existing createScreenplayWithProductionInfo but modify it to just save production info
    // since screenplay is already created
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

  return (
    <div className="space-y-6">
      {/* Title Entry Section */}
      <Card className="poppins-text bg-white border border-border rounded-2xl">
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
              className="bg-white text-foreground rounded-md"
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        <Card className="poppins-text bg-white border border-border rounded-2xl">
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
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
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

            {state.screenplayId && (
              <Production_info
                screenplayId={state.screenplayId}
                onSave={handleProductionInfoSave}
              />
            )}

            {/* Error/Success Messages */}
            {state.errors.productionInfo && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.errors.productionInfo}</AlertDescription>
              </Alert>
            )}

            {state.success.productionInfo && (
              <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{state.success.productionInfo}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {state.isCreatingScreenplay && (
              <Alert className="mt-4">
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