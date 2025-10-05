import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft,
  ArrowRight,
  X,
  Hash,
  FileText,
  Clock,
  MapPin,
  Loader2,
  Edit2,
  Check,
  AlertCircle,
  Sparkles,
  Trash2
} from 'lucide-react';
import { SceneDetail, SceneUpdateRequest, SceneLookupResponse, scenesService } from '@/services/api/scenesService';
import { agentsService } from '@/services/api/agents';
import { useToastHelper } from '@/hooks/useToastHelper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MasterBreakdownEditor } from '@/components/masterBreakdown';
import { MasterBreakdownResponse, masterBreakdownService } from '@/services/api/masterBreakdownService';

interface SceneDetailPanelProps {
  selectedScene: SceneDetail | null;
  sceneContext: any;
  detailLoading: boolean;
  screenplayId: string;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onSceneUpdate: (updatedScene: SceneDetail) => void;
  onSceneDeleted?: () => void;
  onBreakdownUpdate?: (breakdown: MasterBreakdownResponse) => void;
  className?: string;
}

const SceneDetailPanel: React.FC<SceneDetailPanelProps> = ({
  selectedScene,
  sceneContext,
  detailLoading,
  screenplayId,
  onClose,
  onNavigate,
  onSceneUpdate,
  onSceneDeleted,
  onBreakdownUpdate,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SceneUpdateRequest>({
    scene_number: '',
    header: '',
    body: '',
    int_ext: '',
    day_night: '',
    set_name: '',
    page_num: 1,
    page_eighths: 1,
    synopsis: '',
    script_day: 1,
    sequence: 1,
    est_minutes: 1,
    comment: '',
    location: ''
  });
  const [lookupValues, setLookupValues] = useState<SceneLookupResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Autofill state
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const { showLoading, updateToast } = useToastHelper();
  
  // Breakdown state
  const [breakdown, setBreakdown] = useState<MasterBreakdownResponse | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Load available lookup values
  useEffect(() => {
    if (selectedScene && screenplayId) {
      loadLookupValues();
    }
  }, [selectedScene, screenplayId]);

  // Load breakdown data
  useEffect(() => {
    if (selectedScene && screenplayId) {
      loadBreakdown();
    }
  }, [selectedScene, screenplayId]);

  // Initialize form data when scene changes
  useEffect(() => {
    if (selectedScene) {
      setFormData({
        scene_number: selectedScene.scene_number,
        header: selectedScene.header,
        body: selectedScene.body,
        int_ext: selectedScene.int_ext,
        day_night: selectedScene.day_night,
        set_name: selectedScene.set_name,
        page_num: selectedScene.page_num,
        page_eighths: selectedScene.page_eighths,
        synopsis: selectedScene.synopsis,
        script_day: selectedScene.script_day,
        sequence: selectedScene.sequence,
        est_minutes: selectedScene.est_minutes,
        comment: selectedScene.comment,
        location: selectedScene.location
      });
      
      // Reset breakdown and loading state when scene changes
      setBreakdown(null);
      setBreakdownLoading(false);
      setError(null);
    }
  }, [selectedScene]);

  const loadLookupValues = async () => {
    try {
      const response = await scenesService.getAvailableLookupValues(screenplayId);
      setLookupValues(response);
    } catch (err: any) {
      console.error('Failed to load lookup values:', err);
    }
  };

  const loadBreakdown = async () => {
    if (!selectedScene) return;
    
    try {
      setBreakdownLoading(true);
      setBreakdownError(null);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000); // Reduced timeout
      });
      
      const response = await Promise.race([
        masterBreakdownService.getSceneBreakdown(screenplayId, selectedScene.scene_id),
        timeoutPromise
      ]) as MasterBreakdownResponse;
      
      setBreakdown(response);
    } catch (err: any) {
      console.error('Failed to load breakdown:', err);
      const errorMessage = err.message === 'Request timeout' 
        ? 'Loading timed out. Please try again.' 
        : 'Failed to load elements. Please try again.';
      setBreakdownError(errorMessage);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleBreakdownUpdate = useCallback(async (updatedBreakdown: MasterBreakdownResponse) => {
    setBreakdown(updatedBreakdown);
    if (onBreakdownUpdate) {
      onBreakdownUpdate(updatedBreakdown);
    }
    const { showSuccess } = useToastHelper();
    showSuccess('Elements updated successfully', '');
  }, [onBreakdownUpdate]);


 const handleAutofill = async () => {
    if (!selectedScene || isAutoFilling) return;

    setIsAutoFilling(true);
    setError(null);
    setBreakdownError(null);
    
    const toastId = showLoading(
      'AI is analyzing scene...',
      'This may take a moment',
      { minimal: true, persistent: true }
    );

    try {
      const response = await agentsService.autofillScene(
        screenplayId,
        selectedScene.scene_id,
        true
      );

      if (response.success) {
        updateToast(toastId, {
          type: 'success',
          title: 'Autofill Complete!',
          description: 'Scene elements have been updated',
          minimal: true,
          persistent: false,
          duration: 3000
        });
        
        // Force reload both scene data and breakdown
        await Promise.all([
          loadLookupValues(), // Refresh lookup values
          loadBreakdown(), // Refresh breakdown
          // Optionally reload scene details if they can change
          reloadSceneDetails()
        ]);
        
      } else {
        throw new Error(response.message || 'Autofill failed');
      }
    } catch (error: any) {
      updateToast(toastId, {
        type: 'error',
        title: 'Autofill Failed',
        description: error.message || 'Please try again',
        minimal: true,
        persistent: false,
        duration: 4000
      });
      
      setError(error.message || 'Failed to autofill scene');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const reloadSceneDetails = async () => {
    if (!selectedScene) return;
    
    try {
      const response = await scenesService.getSceneDetail(screenplayId, selectedScene.scene_id);
      const updatedScene: SceneDetail = {
        ...selectedScene,
        ...response.data,
        scene_id: selectedScene.scene_id,
        created_at: selectedScene.created_at,
        word_count: response.data.body.split(' ').length,
        character_count: response.data.body.length,
      };
      
      // Update parent component with fresh data
      onSceneUpdate(updatedScene);
    } catch (err) {
      console.error('Failed to reload scene details:', err);
    }
  };


  const handleInputChange = (field: keyof SceneUpdateRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data to original values
    if (selectedScene) {
      setFormData({
        scene_number: selectedScene.scene_number,
        header: selectedScene.header,
        body: selectedScene.body,
        int_ext: selectedScene.int_ext,
        day_night: selectedScene.day_night,
        set_name: selectedScene.set_name,
        page_num: selectedScene.page_num,
        page_eighths: selectedScene.page_eighths,
        synopsis: selectedScene.synopsis,
        script_day: selectedScene.script_day,
        sequence: selectedScene.sequence,
        est_minutes: selectedScene.est_minutes,
        comment: selectedScene.comment,
        location: selectedScene.location
      });
    }
  };

  const handleSave = async () => {
    if (!selectedScene) return;

    try {
      setSaving(true);
      setError(null);
      await scenesService.updateScene(screenplayId, selectedScene.scene_id, formData);
      const updatedScene: SceneDetail = {
        ...selectedScene,
        scene_number: formData.scene_number,
        header: formData.header,
        body: formData.body,
        int_ext: formData.int_ext,
        day_night: formData.day_night,
        set_name: formData.set_name,
        page_num: formData.page_num,
        page_eighths: formData.page_eighths,
        synopsis: formData.synopsis,
        script_day: formData.script_day,
        sequence: formData.sequence,
        est_minutes: formData.est_minutes,
        comment: formData.comment,
        location: formData.location
      };

      onSceneUpdate(updatedScene);
      setIsEditing(false);
    } catch (err: any) {
      setError('Failed to save scene changes');
      console.error('Error saving scene:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete scene
  const handleDelete = async () => {
    if (!selectedScene) return;

    try {
      setDeleting(true);
      setError(null);

      await scenesService.deleteScene(screenplayId, selectedScene.scene_id);
      onSceneDeleted?.(); // Refresh scenes list
      onClose(); // Close the panel after successful deletion
    } catch (err: any) {
      setError('Failed to delete scene');
      console.error('Error deleting scene:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className={`flex-1 border-l border-border flex flex-col bg-background poppins-text rounded-2xl shadow-sm ${className}`}>
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-2 py-1 text-sm font-mono">
              {selectedScene?.scene_number}
            </Badge>
            <div>
              <h2 className="text-md font-semibold tracking-tight">{selectedScene?.header && (
                  selectedScene.header
              )}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Navigation */}
            {sceneContext?.previous_scene && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('prev')}
                disabled={detailLoading || isEditing}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {sceneContext?.next_scene && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('next')}
                disabled={detailLoading || isEditing}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {/* Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAutofill}
              disabled={detailLoading || isAutoFilling || isEditing}
              className="h-8 w-8 p-0"
              title="AI Autofill"
            >
              {isAutoFilling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
            
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={detailLoading}
                className="h-8 w-8 p-0"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-8 px-3"
                  title="Save"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="h-8 w-8 p-0"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Delete scene"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Confirm delete"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-8 w-8 p-0"
                  title="Cancel delete"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading scene details...</span>
            </div>
          </div>
        ) : selectedScene ? (
          <div className="px-6 py-6 space-y-8">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Scene Statistics */}
            <section className="grid grid-cols-4 gap-6 p-4 bg-muted/30 rounded-lg border">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-background rounded-md mx-auto mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">{selectedScene.int_ext || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Scene Type</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-background rounded-md mx-auto mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">{selectedScene.day_night || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Time of Day</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-background rounded-md mx-auto mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">{selectedScene.est_minutes}m</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-background rounded-md mx-auto mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium truncate" title={selectedScene.location}>
                  {selectedScene.location || 'No location'}
                </div>
                <div className="text-xs text-muted-foreground">Location</div>
              </div>
            </section>

            {/* Scene Properties */}
            <section className="space-y-6">
              <h3 className="text-base font-semibold border-b border-border pb-2">Scene Properties</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Scene Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Scene Type</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Select value={formData.int_ext} onValueChange={(value) => handleInputChange('int_ext', value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupValues?.data.int_ext_labels?.flat().map((label, index) => (
                            <SelectItem key={`${label}-${index}`} value={label}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={formData.int_ext}
                        onChange={(e) => handleInputChange('int_ext', e.target.value.toUpperCase())}
                        placeholder="Custom value"
                        className="h-9 poppins-text rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedScene.int_ext}</Badge>
                      <Badge variant="outline">{selectedScene.day_night}</Badge>
                    </div>
                  )}
                </div>
                
                {/* Day/Night */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Time of Day</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Select value={formData.day_night} onValueChange={(value) => handleInputChange('day_night', value)}>
                        <SelectTrigger className="h-9 poppins-text rounded-full">
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupValues?.data.day_night_labels?.flat().map((label, index) => (
                            <SelectItem key={`${label}-${index}`} value={label}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={formData.day_night}
                        onChange={(e) => handleInputChange('day_night', e.target.value.toUpperCase())}
                        placeholder="Custom value"
                        className="h-9 poppins-text rounded-full"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{selectedScene.day_night}</p>
                  )}
                </div>
              </div>

              {/* Set Name */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Set</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Select value={formData.set_name} onValueChange={(value) => handleInputChange('set_name', value)}>
                      <SelectTrigger className="h-9 poppins-text rounded-full">
                        <SelectValue placeholder="Select set" />
                      </SelectTrigger>
                      <SelectContent>
                        {lookupValues?.data.sets?.flat().map((set, index) => (
                          <SelectItem key={`${set}-${index}`} value={set}>{set}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={formData.set_name}
                      onChange={(e) => handleInputChange('set_name', e.target.value)}
                      placeholder="Custom set name"
                      className="h-9 poppins-text rounded-full"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{selectedScene.set_name}</p>
                )}
              </div>

              {/* Numeric Fields */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Page</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.page_num}
                      onChange={(e) => handleInputChange('page_num', parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-9 poppins-text rounded-full"
                    />
                  ) : (
                    <div className="py-2 text-sm">{selectedScene.page_num}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Script Day</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.script_day}
                      onChange={(e) => handleInputChange('script_day', parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-9 poppins-text rounded-full"
                    />
                  ) : (
                    <div className="py-2 text-sm">{selectedScene.script_day}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minutes</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.est_minutes}
                      onChange={(e) => handleInputChange('est_minutes', parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-9 poppins-text rounded-full"
                    />
                  ) : (
                    <div className="py-2 text-sm">{selectedScene.est_minutes}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sequence</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.sequence}
                      onChange={(e) => handleInputChange('sequence', parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-9 poppins-text rounded-full"
                    />
                  ) : (
                    <div className="py-2 text-sm">{selectedScene.sequence}</div>
                  )}
                </div>
              </div>

              {/* Editing-only fields */}
              {isEditing && (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Scene Number</label>
                    <Input
                      value={formData.scene_number}
                      onChange={(e) => handleInputChange('scene_number', e.target.value)}
                      placeholder="Scene number"
                      className="h-9 poppins-text rounded-full"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Header</label>
                    <Input
                      value={formData.header}
                      onChange={(e) => handleInputChange('header', e.target.value)}
                      placeholder="Scene header"
                      className="h-9 poppins-text rounded-full"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Scene location"
                      className="h-9 poppins-text rounded-full"
                    />
                  </div>
                </>
              )}
            </section>

            {/* Synopsis */}
            {(selectedScene.synopsis || isEditing) && (
              <section className="space-y-4">
                <h3 className="text-base font-semibold border-b border-border pb-2">Synopsis</h3>
                {isEditing ? (
                  <Textarea
                    value={formData.synopsis}
                    onChange={(e) => handleInputChange('synopsis', e.target.value)}
                    placeholder="Scene synopsis"
                    rows={3}
                    className="resize-none poppins-text rounded-full"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedScene.synopsis}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Notes */}
            {(selectedScene.comment || isEditing) && (
              <section className="space-y-4">
                <h3 className="text-base font-semibold border-b border-border pb-2">Notes</h3>
                {isEditing ? (
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    placeholder="Director notes or comments"
                    rows={3}
                    className="resize-none"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedScene.comment}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Scene Content */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold border-b border-border pb-2">Scene Content</h3>
              {isEditing ? (
                <Textarea
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  placeholder="Scene content"
                  rows={12}
                  className="font-mono text-sm resize-none"
                />
              ) : (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {selectedScene.body}
                  </pre>
                </div>
              )}
            </section>

            {/* Master Breakdown */}
            <section className="space-y-4 border-t border-border">
              <div className="flex items-center justify-between">
                {breakdownLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading breakdown...
                  </div>
                )}
                {error && !breakdownLoading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadBreakdown}
                  >
                    Retry
                  </Button>
                )}
              </div>
              
              <MasterBreakdownEditor
                breakdown={breakdown}
                screenplayId={screenplayId}
                sceneId={selectedScene.scene_id}
                onUpdate={handleBreakdownUpdate}
                isUpdating={breakdownLoading}
              />
            </section>

            {/* Navigation Context */}
            {sceneContext && (
              <section className="border-t border-border pt-6">
                <div className="text-center space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Scene {sceneContext.position} of {sceneContext.total_scenes}
                  </div>
                  <div className="space-y-2 text-sm">
                    {sceneContext.previous_scene && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Previous:</span> {sceneContext.previous_scene.header}
                      </div>
                    )}
                    {sceneContext.next_scene && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Next:</span> {sceneContext.next_scene.header}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SceneDetailPanel;