import { useCallback, useState, useEffect } from 'react';
import { useProductionInfo as useProductionInfoContext } from '@/contexts/ProductionInfoContext';
import { ProductionInfo } from '@/types';

// Hook for production info operations with editing state
export const useProductionInfoEditor = (screenplayId: string) => {
  const context = useProductionInfoContext();
  const [isEditing, setIsEditing] = useState(false);

  // Load production info when screenplayId changes
  useEffect(() => {
    if (screenplayId && screenplayId !== 'temp-setup') {
      context.loadProductionInfo(screenplayId);
    }
  }, [screenplayId, context.loadProductionInfo]);

  // Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
    context.setError(null);
    context.setSuccess(null);
  }, [context]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    context.resetToOriginal();
  }, [context]);

  // Save changes
  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!context.productionInfo) return false;
    
    const success = await context.saveProductionInfo(screenplayId, context.productionInfo);
    if (success) {
      setIsEditing(false);
    }
    return success;
  }, [context, screenplayId]);

  // Update field and mark as editing
  const updateField = useCallback((field: keyof ProductionInfo, value: any) => {
    context.updateField(field, value);
    // Always set editing to true when user makes changes
    setIsEditing(true);
  }, [context]);

  // Update array field and mark as editing
  const updateArrayField = useCallback((field: keyof ProductionInfo, value: string) => {
    context.updateArrayField(field, value);
    // Always set editing to true when user makes changes
    setIsEditing(true);
  }, [context]);

  return {
    ...context,
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    updateArrayField
  };
};

// Hook for production info validation
export const useProductionInfoValidation = () => {
  const validateProductionInfo = useCallback((data: ProductionInfo): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required field validations
    if (!data.company_name?.trim()) {
      errors.push('Company name is required');
    }

    if (!data.director_name?.trim()) {
      errors.push('Director name is required');
    }

    if (!data.genre?.trim()) {
      errors.push('Genre is required');
    }

    // Date validations
    if (data.shoot_start_date && data.shoot_end_date) {
      const startDate = new Date(data.shoot_start_date);
      const endDate = new Date(data.shoot_end_date);
      
      if (startDate >= endDate) {
        errors.push('Shoot end date must be after shoot start date');
      }
    }

    // Array field validations
    if (data.producer_names && data.producer_names.length === 0) {
      errors.push('At least one producer is required');
    }

    if (data.writer_names && data.writer_names.length === 0) {
      errors.push('At least one writer is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    validateProductionInfo
  };
};

// Hook for production info formatting and display
export const useProductionInfoFormatter = () => {
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const formatArray = useCallback((array: string[] | undefined): string => {
    if (!array || array.length === 0) return 'Not specified';
    return array.join(', ');
  }, []);

  const formatDuration = useCallback((startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch {
      return 'Calculating...';
    }
  }, []);

  const getProductionStatusColor = useCallback((status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pre-production')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('production')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('post-production')) return 'bg-purple-100 text-purple-800';
    if (statusLower.includes('completed')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  }, []);

  return {
    formatDate,
    formatArray,
    formatDuration,
    getProductionStatusColor
  };
};

// Hook for production info actions (CRUD operations)
export const useProductionInfoActions = () => {
  const context = useProductionInfoContext();

  const createProductionInfo = useCallback(async (screenplayId: string, data: ProductionInfo): Promise<boolean> => {
    return await context.saveProductionInfo(screenplayId, data);
  }, [context]);

  const updateProductionInfo = useCallback(async (screenplayId: string, data: Partial<ProductionInfo>): Promise<boolean> => {
    return await context.updateProductionInfo(screenplayId, data);
  }, [context]);

  const loadProductionInfo = useCallback(async (screenplayId: string): Promise<void> => {
    await context.loadProductionInfo(screenplayId);
  }, [context]);

  const clearProductionInfo = useCallback(() => {
    context.clearProductionInfo();
  }, [context]);

  return {
    createProductionInfo,
    updateProductionInfo,
    loadProductionInfo,
    clearProductionInfo,
    isLoading: context.isLoading,
    isSaving: context.isSaving,
    error: context.error,
    success: context.success,
    setError: context.setError,
    setSuccess: context.setSuccess
  };
};

// Hook for production info state management
export const useProductionInfoState = () => {
  const context = useProductionInfoContext();

  return {
    productionInfo: context.productionInfo,
    hasExistingData: context.hasExistingData,
    isLoading: context.isLoading,
    isSaving: context.isSaving,
    error: context.error,
    success: context.success,
    updateField: context.updateField,
    updateArrayField: context.updateArrayField,
    getArrayDisplayValue: context.getArrayDisplayValue,
    formatDate: context.formatDate,
    resetToOriginal: context.resetToOriginal
  };
};
