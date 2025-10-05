import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { scenesService } from '@/services/api/scenesService'
import { cn } from '@/lib/utils'
import TextareaAutosize from 'react-textarea-autosize'

interface AddSceneDialogProps {
  screenplayId: string
  onSceneAdded?: () => void
  className?: string
  afterSceneNumber?: string
  trigger?: React.ReactNode
  showTrigger?: boolean
}

interface AddSceneData {
  scene_number: string
  header: string
  body: string
  position: 'start' | 'end' | 'after'
  after_scene_number?: string
}

const AddSceneDialog: React.FC<AddSceneDialogProps> = ({
  screenplayId,
  onSceneAdded,
  className = '',
  afterSceneNumber,
  trigger,
  showTrigger = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<AddSceneData>({
    scene_number: '',
    header: '',
    body: '',
    position: afterSceneNumber ? 'after' : 'end',
    after_scene_number: afterSceneNumber,
  })

  const [availableSceneNumbers, setAvailableSceneNumbers] = useState<string[]>([])
  const [loadingSceneNumbers, setLoadingSceneNumbers] = useState(false)

  useEffect(() => {
    if (isOpen) loadSceneNumbers()
  }, [isOpen, screenplayId])

  const loadSceneNumbers = async () => {
    setLoadingSceneNumbers(true)
    try {
      const response = await scenesService.getScenesSummary(screenplayId, 1, 1000, 120)
      const sceneNumbers = response.scenes.map((s: any) => s.scene_number)
      setAvailableSceneNumbers(sceneNumbers)
    } catch (e) {
      console.error('Failed to load scene numbers:', e)
    } finally {
      setLoadingSceneNumbers(false)
    }
  }

  const setField = (field: keyof AddSceneData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }))
    setError('')
    setSuccess('')
    setFieldErrors((fe) => ({ ...fe, [field]: '' }))
  }

  const validateForm = (): boolean => {
    const fe: Record<string, string> = {}

     if (!formData.scene_number.trim()) fe.scene_number = 'Required'

    if (!formData.header.trim()) fe.header = 'Required'
    else {
      const hu = formData.header.toUpperCase()
      if (!hu.startsWith('INT.') && !hu.startsWith('EXT.')) fe.header = 'Start with INT. or EXT.'
    }

    if (!formData.body.trim()) fe.body = 'Required'

    if (formData.position === 'after' && !formData.after_scene_number) {
      fe.after_scene_number = 'Select a scene'
    }

    setFieldErrors(fe)
    if (Object.keys(fe).length) {
      setError('Please fix the highlighted fields.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload: any = {
        scene_number: formData.scene_number,
        header: formData.header,
        body: formData.body,
        position: formData.position,
      }
      if (formData.position === 'after') payload.after_scene_number = formData.after_scene_number

      await scenesService.addScene(screenplayId, payload)
      setSuccess('Scene added successfully!')

      setFormData({
        scene_number: '',
        header: '',
        body: '',
        position: afterSceneNumber ? 'after' : 'end',
        after_scene_number: afterSceneNumber,
      })

      setTimeout(() => {
        setIsOpen(false)
        setSuccess('')
        onSceneAdded?.()
      }, 900)
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to add scene. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setFormData({
        scene_number: '',
        header: '',
        body: '',
        position: 'end',
      })
      setError('')
      setSuccess('')
      setFieldErrors({})
    }
  }

  // derived helper
  const bodyCount = formData.body.length

  return (
    <>
      {showTrigger && (
        <div onClick={() => setIsOpen(true)} className={cn('cursor-pointer', className)}>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Scene
            </Button>
          )}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}  >
        <DialogContent className="max-w-2xl w-[92vw] sm:w-full p-0 overflow-hidden poppins-text bg-accent text-foreground">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2 text-lg py-2">
              Add New Scene
            </DialogTitle>
            <DialogDescription className="text-sm">
              Create a new scene for your screenplay. Fill in the required details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-4 pt-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Section: Placement */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Placement</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="scene_number">Scene Number *</Label>
                  <Input
                    id="scene_number"
                    autoComplete="off"
                    type="text"
                    placeholder="e.g., 1, 1A, 2B..."
                    value={formData.scene_number}
                    onChange={(e) => setField('scene_number', e.target.value)}
                    disabled={isLoading}
                    className="poppins-text rounded-md border-border"
                  />
                  {fieldErrors.scene_number && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.scene_number}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    id="position"
                    autoComplete="off"
                    value={formData.position}
                    onValueChange={(v: string) => setField('position', v as 'start' | 'end' | 'after')}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="end">Add at End</SelectItem>
                      <SelectItem value="start">Add at Start</SelectItem>
                      <SelectItem value="after">Insert After Scene</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.position && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.position}</p>
                  )}
                </div>
              </div>

              {formData.position === 'after' && (
                <div className="space-y-1.5">
                  <Label htmlFor="after_scene_number">Insert After Scene *</Label>
                  <Select
                    value={formData.after_scene_number || ''}
                    onValueChange={(v) => setField('after_scene_number', v)}
                    disabled={isLoading || loadingSceneNumbers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSceneNumbers ? 'Loading scenes...' : 'Select scene'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSceneNumbers.map((n) => (
                        <SelectItem key={n} value={n}>
                          Scene {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.after_scene_number && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.after_scene_number}</p>
                  )}
                </div>
              )}
            </div>

            {/* Section: Content */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Content</h4>

              <div className="space-y-1.5">
                <Label htmlFor="header">Scene Header *</Label>
                <Input
                  id="header"
                  autoComplete="off"
                  placeholder="INT. LIVING ROOM - DAY"
                  value={formData.header}
                  onChange={(e) => setField('header', e.target.value)}
                  disabled={isLoading}
                  className="font-mono poppins-text rounded-md border-border"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Start with INT. or EXT., followed by location and time of day
                  </p>
                  {fieldErrors.header && (
                    <p className="text-xs text-destructive">{fieldErrors.header}</p>
                  )}
                </div>
              </div>

               <div className="space-y-1.5">
                 <Label htmlFor="body">Scene Body *</Label>
                 <TextareaAutosize
                   id="body"
                   autoComplete="off"
                   minRows={6}
                   maxRows={18}
                   placeholder="Enter the scene content, dialogue, and action..."
                   value={formData.body}
                   onChange={(e: any) => setField('body', e.target.value)}
                   disabled={isLoading}
                   className={cn(
                     'w-full resize-y bg-background text-foreground font-mono text-sm rounded-md border border-border px-3 py-2',
                     'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                   )}
                 />
                 <div className="flex items-center justify-between">
                   <p className="text-xs text-muted-foreground">{bodyCount} characters</p>
                   {fieldErrors.body && <p className="text-xs text-destructive">{fieldErrors.body}</p>}
                 </div>
               </div>
            </div>

            {/* Sticky footer actions */}
            <div className="sticky bottom-0 bg-background pt-4 border-t border-border -mx-6 px-6">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Scene
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddSceneDialog
