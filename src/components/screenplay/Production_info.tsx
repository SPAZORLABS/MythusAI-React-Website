import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Edit3, 
  Film, 
  PlayCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Camera,
  Palette,
  Calendar,
  Building
} from 'lucide-react'
import { ProductionInfo } from '@/types'
import { cn } from '@/lib/utils'
import { useProductionInfoEditor } from '@/hooks/useProductionInfo'

interface ProductionInfoProps {
  screenplayId: string
  onSave?: (productionInfo: ProductionInfo) => void
  className?: string
}

export const Production_info: React.FC<ProductionInfoProps> = ({ 
  screenplayId, 
  onSave,
  className 
}) => {
  const {
    productionInfo,
    isLoading,
    isSaving,
    error,
    success,
    hasExistingData,
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    updateArrayField,
    getArrayDisplayValue,
    formatDate
  } = useProductionInfoEditor(screenplayId)

  useEffect(() => {
    console.log("Edit mode:", isEditing);
  }, [isEditing]);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    company: true,
    personnel: false,
    technical: false,
    art: false,
    other: false,
    schedule: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Helper component for required field labels
  const RequiredLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ 
    children, 
    required = false 
  }) => (
    <label className="text-sm font-medium text-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
  )

  

  // Helper component for collapsible card headers
  const CollapsibleCardHeader: React.FC<{
    title: string
    icon: React.ReactNode
    isExpanded: boolean
    onToggle: () => void
    itemCount?: number
  }> = ({ title, icon, isExpanded, onToggle, itemCount }) => (
    <CardHeader 
      className="bg-gradient-to-r from-secondary to-secondary/80 cursor-pointer hover:from-secondary/90 hover:to-secondary/70 transition-all duration-200 rounded-t-lg"
      onClick={onToggle}
    >
      <CardTitle className="flex items-center justify-between text-foreground">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-lg font-semibold">{title}</span>
          {itemCount && (
            <Badge variant="outline" className="text-xs">
              {itemCount} fields
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </CardTitle>
    </CardHeader>
  )
  useEffect(() => {
    if (screenplayId) {
      // The context will handle loading
    }
  }, [screenplayId])

  const handleSave = async () => {
    const success = await saveChanges()
    if (success && productionInfo) {
      onSave?.(productionInfo)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading production information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-8 bg-gradient-to-br from-background to-secondary/20 p-6 rounded-xl bg-secondary", className)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-border/50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Production Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your film's production details and crew information
            </p>
          </div>
          {hasExistingData && (
            <Badge variant="secondary" className="ml-4 px-3 py-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Data Saved
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing && (
            <Button
              onClick={startEditing}
              variant="outline"
              className="gap-2 px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Edit Information
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                onClick={cancelEditing}
                variant="outline"
                className="gap-2 px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 px-6 py-2 bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
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

      {/* Production Info Form */}
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Complete your production information</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              <span className="text-red-500">*</span> Required fields
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Basic Information */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Basic Information"
              icon={<Info className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.basic}
              onToggle={() => toggleSection('basic')}
              itemCount={2}
            />
            {expandedSections.basic && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel required>Genre</RequiredLabel>
                    <Input
                      value={productionInfo?.genre || ''}
                      onChange={(e) => updateField('genre', e.target.value)}
                      placeholder="e.g., Drama, Comedy, Action, Thriller"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel required>Production Status</RequiredLabel>
                    <Input
                      value={productionInfo?.production_status || ''}
                      onChange={(e) => updateField('production_status', e.target.value)}
                      placeholder="e.g., Pre-production, In Production, Post-production"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Company Information */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Company Information"
              icon={<Building className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.company}
              onToggle={() => toggleSection('company')}
              itemCount={4}
            />
            {expandedSections.company && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel required>Company Name</RequiredLabel>
                    <Input
                      value={productionInfo?.company_name || ''}
                      onChange={(e) => updateField('company_name', e.target.value)}
                      placeholder="Enter production company name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Production Number</RequiredLabel>
                    <Input
                      value={productionInfo?.production_number || ''}
                      onChange={(e) => updateField('production_number', e.target.value)}
                      placeholder="Enter unique production number"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel required>Title</RequiredLabel>
                    <Input
                      value={productionInfo?.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Enter film/project title"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Company Address</RequiredLabel>
                    <Input
                      value={productionInfo?.company_address || ''}
                      onChange={(e) => updateField('company_address', e.target.value)}
                      placeholder="Enter company address"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Key Personnel */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Key Personnel"
              icon={<Users className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.personnel}
              onToggle={() => toggleSection('personnel')}
              itemCount={8}
            />
            {expandedSections.personnel && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel required>Director</RequiredLabel>
                    <Input
                      value={productionInfo?.director_name || ''}
                      onChange={(e) => updateField('director_name', e.target.value)}
                      placeholder="Enter director's full name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Line Producer</RequiredLabel>
                    <Input
                      value={productionInfo?.line_producer_name || ''}
                      onChange={(e) => updateField('line_producer_name', e.target.value)}
                      placeholder="Enter line producer's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <RequiredLabel>Producers</RequiredLabel>
                    <Input
                      value={getArrayDisplayValue('producer_names')}
                      onChange={(e) => updateArrayField('producer_names', e.target.value)}
                      placeholder="Producer 1, Producer 2, Producer 3 (comma-separated)"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple names with commas</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <RequiredLabel>Writers</RequiredLabel>
                    <Input
                      value={getArrayDisplayValue('writer_names')}
                      onChange={(e) => updateArrayField('writer_names', e.target.value)}
                      placeholder="Writer 1, Writer 2, Writer 3 (comma-separated)"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple names with commas</p>
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Executive Producer</RequiredLabel>
                    <Input
                      value={productionInfo?.executive_producer || ''}
                      onChange={(e) => updateField('executive_producer', e.target.value)}
                      placeholder="Enter executive producer's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Unit Production Manager</RequiredLabel>
                    <Input
                      value={productionInfo?.unit_production_manager || ''}
                      onChange={(e) => updateField('unit_production_manager', e.target.value)}
                      placeholder="Enter UPM's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Production Accountant</RequiredLabel>
                    <Input
                      value={productionInfo?.production_accountant || ''}
                      onChange={(e) => updateField('production_accountant', e.target.value)}
                      placeholder="Enter production accountant's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <RequiredLabel>Assistant Directors</RequiredLabel>
                    <Input
                      value={getArrayDisplayValue('assistant_directors')}
                      onChange={(e) => updateArrayField('assistant_directors', e.target.value)}
                      placeholder="1st AD, 2nd AD, 3rd AD (comma-separated)"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple names with commas</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Technical Crew */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Technical Crew"
              icon={<Camera className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.technical}
              onToggle={() => toggleSection('technical')}
              itemCount={6}
            />
            {expandedSections.technical && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel>Director of Photography</RequiredLabel>
                    <Input
                      value={productionInfo?.director_of_photography || ''}
                      onChange={(e) => updateField('director_of_photography', e.target.value)}
                      placeholder="Enter DOP's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>First Assistant Camera</RequiredLabel>
                    <Input
                      value={productionInfo?.first_assistant_camera || ''}
                      onChange={(e) => updateField('first_assistant_camera', e.target.value)}
                      placeholder="Enter 1st AC's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Focus Puller 1</RequiredLabel>
                    <Input
                      value={productionInfo?.focus_puller_1 || ''}
                      onChange={(e) => updateField('focus_puller_1', e.target.value)}
                      placeholder="Enter focus puller 1's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Focus Puller 2</RequiredLabel>
                    <Input
                      value={productionInfo?.focus_puller_2 || ''}
                      onChange={(e) => updateField('focus_puller_2', e.target.value)}
                      placeholder="Enter focus puller 2's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Gaffer</RequiredLabel>
                    <Input
                      value={productionInfo?.gaffer || ''}
                      onChange={(e) => updateField('gaffer', e.target.value)}
                      placeholder="Enter gaffer's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>On-Set Editor</RequiredLabel>
                    <Input
                      value={productionInfo?.on_set_editor || ''}
                      onChange={(e) => updateField('on_set_editor', e.target.value)}
                      placeholder="Enter on-set editor's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Art Department */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Art Department"
              icon={<Palette className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.art}
              onToggle={() => toggleSection('art')}
              itemCount={4}
            />
            {expandedSections.art && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel>Production Designer</RequiredLabel>
                    <Input
                      value={productionInfo?.production_designer || ''}
                      onChange={(e) => updateField('production_designer', e.target.value)}
                      placeholder="Enter production designer's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Art Director</RequiredLabel>
                    <Input
                      value={productionInfo?.art_director || ''}
                      onChange={(e) => updateField('art_director', e.target.value)}
                      placeholder="Enter art director's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Assistant Art Director</RequiredLabel>
                    <Input
                      value={productionInfo?.assistant_art_director || ''}
                      onChange={(e) => updateField('assistant_art_director', e.target.value)}
                      placeholder="Enter assistant art director's name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Art Team</RequiredLabel>
                    <Input
                      value={productionInfo?.art_team || ''}
                      onChange={(e) => updateField('art_team', e.target.value)}
                      placeholder="Enter art team members"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Other Departments */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Other Departments"
              icon={<Building className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.other}
              onToggle={() => toggleSection('other')}
              itemCount={5}
            />
            {expandedSections.other && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel>Wardrobe Department</RequiredLabel>
                    <Input
                      value={productionInfo?.wardrobe_department || ''}
                      onChange={(e) => updateField('wardrobe_department', e.target.value)}
                      placeholder="Enter wardrobe department"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Makeup & Hair Department</RequiredLabel>
                    <Input
                      value={productionInfo?.makeup_hair_department || ''}
                      onChange={(e) => updateField('makeup_hair_department', e.target.value)}
                      placeholder="Enter makeup & hair department"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Action Director</RequiredLabel>
                    <Input
                      value={productionInfo?.action_director || ''}
                      onChange={(e) => updateField('action_director', e.target.value)}
                      placeholder="Enter action director name"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Direction Department</RequiredLabel>
                    <Input
                      value={productionInfo?.direction_department || ''}
                      onChange={(e) => updateField('direction_department', e.target.value)}
                      placeholder="Enter direction department"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <RequiredLabel>Production Team</RequiredLabel>
                    <Input
                      value={productionInfo?.production_team || ''}
                      onChange={(e) => updateField('production_team', e.target.value)}
                      placeholder="Enter production team"
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Production Schedule */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CollapsibleCardHeader
              title="Production Schedule"
              icon={<Calendar className="h-5 w-5 text-primary" />}
              isExpanded={expandedSections.schedule}
              onToggle={() => toggleSection('schedule')}
              itemCount={2}
            />
            {expandedSections.schedule && (
              <CardContent className="space-y-6 bg-white/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel>Shoot Start Date</RequiredLabel>
                    <Input
                      type="date"
                      value={productionInfo?.shoot_start_date || ''}
                      onChange={(e) => updateField('shoot_start_date', e.target.value)}
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Shoot End Date</RequiredLabel>
                    <Input
                      type="date"
                      value={productionInfo?.shoot_end_date || ''}
                      onChange={(e) => updateField('shoot_end_date', e.target.value)}
                      disabled={!isEditing}
                      className="px-4 py-3 rounded-lg border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Display formatted dates when not editing */}
                {!isEditing && (productionInfo?.shoot_start_date || productionInfo?.shoot_end_date) && (
                  <div className="pt-2 space-y-1">
                    {productionInfo?.shoot_start_date && (
                      <p className="text-sm text-muted-foreground">
                        Start: {formatDate(productionInfo.shoot_start_date)}
                      </p>
                    )}
                    {productionInfo?.shoot_end_date && (
                      <p className="text-sm text-muted-foreground">
                        End: {formatDate(productionInfo.shoot_end_date)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
      </div>

      {/* Summary View (when not editing) */}
      {!isEditing && hasExistingData && (
        <Card className="bg-secondary">
          <CardHeader className="bg-secondary">
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Production Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-secondary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productionInfo?.company_name && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{productionInfo.company_name}</p>
                </div>
              )}
              {productionInfo?.director_name && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Director</p>
                  <p className="text-sm font-medium">{productionInfo.director_name}</p>
                </div>
              )}
              {productionInfo?.genre && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Genre</p>
                  <p className="text-sm font-medium">{productionInfo.genre}</p>
                </div>
              )}
              {productionInfo?.production_status && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <Badge variant="outline">{productionInfo.production_status}</Badge>
                </div>
              )}
              {productionInfo?.shoot_start_date && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Shoot Start</p>
                  <p className="text-sm font-medium">{formatDate(productionInfo.shoot_start_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  )
}
