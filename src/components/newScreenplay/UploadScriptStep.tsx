import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, PlayCircle, Loader2, AlertCircle, CheckCircle2, Scissors, FileText, Plus } from 'lucide-react'
import FileManager from '@/components/files/FileManager'
import PDFViewer from './PDFViewer'
import { Separator } from '@/components/ui/separator'
import { useNewScreenplayWorkflow } from '@/hooks/useNewScreenplayWorkflow'

const UploadScriptStep: React.FC = () => {
  const { 
    state, 
    selectFile, 
    processFile, 
    startManualSceneCreation 
  } = useNewScreenplayWorkflow()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'pdf' | 'manual' | null>(null)
  
  return (
    <Card className="poppins-text bg-white border border-border rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Step 2: Add Scenes to Your Screenplay
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Choose How to Add Scenes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Processing Option */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border border-border rounded-2xl ${
                  selectedMethod === 'pdf' 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod('pdf')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Process PDF Script</h4>
                      <p className="text-sm text-muted-foreground">Upload and extract scenes automatically</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF screenplay and our AI will automatically extract and organize scenes for you.
                  </p>
                </CardContent>
              </Card>

              {/* Manual Creation Option */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border border-border rounded-2xl ${
                  selectedMethod === 'manual' 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod('manual')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Scissors className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Create Manually</h4>
                      <p className="text-sm text-muted-foreground">Build scenes from scratch</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create scenes manually with full control over structure, characters, and content.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* PDF Processing Section */}
          {selectedMethod === 'pdf' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">PDF Script Processing</h3>
                  {state.selectedFile && (
                    <Badge variant="secondary">
                      Selected: {state.selectedFile}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="gap-2 px-4 hover:bg-accent hover:text-accent-foreground rounded-full" onClick={() => setIsOpen(true)}>
                    <FileText className="h-4 w-4" />
                    {state.selectedFile ? 'Change File' : 'Select PDF Script'}
                  </Button>
                  <FileManager
                    onFileSelect={selectFile}
                    selectedFile={state.selectedFile}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                  />
                  
                  {state.selectedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectFile('')}
                      className="text-muted-foreground hover:text-destructive rounded-full"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>

                {/* PDF Preview */}
                {state.selectedFile && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">PDF Preview</h4>
                    <PDFViewer 
                      filename={state.selectedFile} 
                      onClose={() => selectFile('')} 
                    />
                  </div>
                )}

                {/* Processing Section */}
                {state.selectedFile && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Process Script</h3>
                      <Button
                        onClick={processFile}
                        disabled={state.isProcessingFile}
                        className="gap-2"
                      >
                        {state.isProcessingFile ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Process File
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Processing Status */}
                    {state.isProcessingFile && (
                      <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>{state.processingStep}</AlertDescription>
                      </Alert>
                    )}

                    {state.errors.fileProcessing && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{state.errors.fileProcessing}</AlertDescription>
                      </Alert>
                    )}

                    {state.success.fileProcessing && (
                      <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{state.success.fileProcessing}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Manual Scene Creation Section */}
          {selectedMethod === 'manual' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Manual Scene Creation</h3>
                  <Button
                    onClick={startManualSceneCreation}
                    className="gap-2"
                    size="lg"
                  >
                    <Plus className="h-4 w-4" />
                    Start Creating Scenes
                  </Button>
                </div>
                
                <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Scissors className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Create Scenes Manually
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Build your screenplay scene by scene with full control over:
                      </p>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Scene headings and locations</li>
                        <li>• Character dialogue and actions</li>
                        <li>• Scene transitions and formatting</li>
                        <li>• Production notes and metadata</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Method Change Option */}
          {selectedMethod && (
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedMethod(null)}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                Choose Different Method
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UploadScriptStep