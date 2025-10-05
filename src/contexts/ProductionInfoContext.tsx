import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ProductionInfo } from '@/types';
import { productionService, ApiResponse, ProductionInfoResponseWrapper } from '@/services/api/production';

// Production Info Context Type
export interface ProductionInfoContextType {
  // State
  productionInfo: ProductionInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  hasExistingData: boolean;
  
  // Actions
  loadProductionInfo: (screenplayId: string) => Promise<void>;
  saveProductionInfo: (screenplayId: string, data: ProductionInfo) => Promise<boolean>;
  updateProductionInfo: (screenplayId: string, data: Partial<ProductionInfo>) => Promise<boolean>;
  clearProductionInfo: () => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  
  // Utility functions
  updateField: (field: keyof ProductionInfo, value: any) => void;
  updateArrayField: (field: keyof ProductionInfo, value: string) => void;
  getArrayDisplayValue: (field: keyof ProductionInfo) => string;
  formatDate: (dateString: string) => string;
  resetToOriginal: () => void;
}

// Create Production Info context
const ProductionInfoContext = createContext<ProductionInfoContextType | undefined>(undefined);

// Production Info provider component
interface ProductionInfoProviderProps {
  children: ReactNode;
}

export const ProductionInfoProvider: React.FC<ProductionInfoProviderProps> = ({ children }) => {
  // State
  const [productionInfo, setProductionInfo] = useState<ProductionInfo | null>(null);
  const [originalProductionInfo, setOriginalProductionInfo] = useState<ProductionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasExistingData, setHasExistingData] = useState<boolean>(false);

  // Load production info
  const loadProductionInfo = useCallback(async (screenplayId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response: ProductionInfoResponseWrapper = await productionService.getProductionInfo(screenplayId);
      
      if (response.success && response.data) {
        const data = response.data;
        setProductionInfo(data);
        setOriginalProductionInfo(data);
        setHasExistingData(true);
      } else {
        // Initialize with empty data if no existing data
        const emptyData: ProductionInfo = {
          // Basic Information
          company_name: '',
          production_number: '',
          title: '',
          company_address: '',
          genre: '',
          production_status: '',
          shoot_start_date: '',
          shoot_end_date: '',
          
          // Key Personnel
          director_name: '',
          producer_names: [],
          writer_names: [],
          executive_producer: '',
          line_producer_name: '',
          unit_production_manager: '',
          production_accountant: '',
          assistant_directors: [],
          
          // Technical Crew
          director_of_photography: '',
          first_assistant_camera: '',
          focus_puller_1: '',
          focus_puller_2: '',
          gaffer: '',
          on_set_editor: '',
          
          // Art Department
          production_designer: '',
          art_director: '',
          assistant_art_director: '',
          art_team: '',
          
          // Other Departments
          wardrobe_department: '',
          makeup_hair_department: '',
          action_director: '',
          direction_department: '',
          production_team: ''
        };
        setProductionInfo(emptyData);
        setOriginalProductionInfo(emptyData);
        setHasExistingData(false);
      }
    } catch (err: any) {
      console.error('Failed to load production info:', err);
      setError('Failed to load production information');
      
      // Initialize with empty data on error
      const emptyData: ProductionInfo = {
        // Basic Information
        company_name: '',
        production_number: '',
        title: '',
        company_address: '',
        genre: '',
        production_status: '',
        shoot_start_date: '',
        shoot_end_date: '',
        
        // Key Personnel
        director_name: '',
        producer_names: [],
        writer_names: [],
        executive_producer: '',
        line_producer_name: '',
        unit_production_manager: '',
        production_accountant: '',
        assistant_directors: [],
        
        // Technical Crew
        director_of_photography: '',
        first_assistant_camera: '',
        focus_puller_1: '',
        focus_puller_2: '',
        gaffer: '',
        on_set_editor: '',
        
        // Art Department
        production_designer: '',
        art_director: '',
        assistant_art_director: '',
        art_team: '',
        
        // Other Departments
        wardrobe_department: '',
        makeup_hair_department: '',
        action_director: '',
        direction_department: '',
        production_team: ''
      };
      setProductionInfo(emptyData);
      setOriginalProductionInfo(emptyData);
      setHasExistingData(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save production info (create or update)
  const saveProductionInfo = useCallback(async (screenplayId: string, data: ProductionInfo): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let response: ApiResponse;
      
      if (hasExistingData) {
        response = await productionService.updateProductionInfo(screenplayId, data);
      } else {
        response = await productionService.createProductionInfo(screenplayId, data);
        setHasExistingData(true);
      }

      if (response.success) {
        setProductionInfo(data);
        setOriginalProductionInfo(data);
        setSuccess('Production information saved successfully!');
        return true;
      } else {
        setError(response.message || 'Failed to save production information');
        return false;
      }
    } catch (err: any) {
      console.error('Failed to save production info:', err);
      setError(err.message || 'An error occurred while saving');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [hasExistingData]);

  // Update production info
  const updateProductionInfo = useCallback(async (screenplayId: string, data: Partial<ProductionInfo>): Promise<boolean> => {
    if (!productionInfo) {
      setError('No production info to update');
      return false;
    }

    const updatedData = { ...productionInfo, ...data };
    return await saveProductionInfo(screenplayId, updatedData);
  }, [productionInfo, saveProductionInfo]);

  // Clear production info
  const clearProductionInfo = useCallback(() => {
    setProductionInfo(null);
    setOriginalProductionInfo(null);
    setHasExistingData(false);
    setError(null);
    setSuccess(null);
  }, []);

  // Update field
  const updateField = useCallback((field: keyof ProductionInfo, value: any) => {
    setProductionInfo(prev => {
      // If prev is null, initialize with empty data structure
      if (!prev) {
        const emptyData: ProductionInfo = {
          // Basic Information
          company_name: '',
          production_number: '',
          title: '',
          company_address: '',
          genre: '',
          production_status: '',
          shoot_start_date: '',
          shoot_end_date: '',
          
          // Key Personnel
          director_name: '',
          producer_names: [],
          writer_names: [],
          executive_producer: '',
          line_producer_name: '',
          unit_production_manager: '',
          production_accountant: '',
          assistant_directors: [],
          
          // Technical Crew
          director_of_photography: '',
          first_assistant_camera: '',
          focus_puller_1: '',
          focus_puller_2: '',
          gaffer: '',
          on_set_editor: '',
          
          // Art Department
          production_designer: '',
          art_director: '',
          assistant_art_director: '',
          art_team: '',
          
          // Other Departments
          wardrobe_department: '',
          makeup_hair_department: '',
          action_director: '',
          direction_department: '',
          production_team: ''
        };
        return {
          ...emptyData,
          [field]: value
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);

  // Update array field
  const updateArrayField = useCallback((field: keyof ProductionInfo, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    updateField(field, arrayValue);
  }, [updateField]);

  // Get array display value
  const getArrayDisplayValue = useCallback((field: keyof ProductionInfo): string => {
    if (!productionInfo) return '';
    const value = productionInfo[field];
    return Array.isArray(value) ? value.join(', ') : '';
  }, [productionInfo]);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }, []);

  // Reset to original
  const resetToOriginal = useCallback(() => {
    if (originalProductionInfo) {
      setProductionInfo(originalProductionInfo);
    }
    setError(null);
    setSuccess(null);
  }, [originalProductionInfo]);

  // Context value
  const value: ProductionInfoContextType = {
    // State
    productionInfo,
    isLoading,
    isSaving,
    error,
    success,
    hasExistingData,
    
    // Actions
    loadProductionInfo,
    saveProductionInfo,
    updateProductionInfo,
    clearProductionInfo,
    setError,
    setSuccess,
    
    // Utility functions
    updateField,
    updateArrayField,
    getArrayDisplayValue,
    formatDate,
    resetToOriginal
  };

  return (
    <ProductionInfoContext.Provider value={value}>
      {children}
    </ProductionInfoContext.Provider>
  );
};

// Custom hook to use the Production Info context
export const useProductionInfo = (): ProductionInfoContextType => {
  const context = useContext(ProductionInfoContext);
  if (!context) {
    throw new Error('useProductionInfo must be used within a ProductionInfoProvider');
  }
  return context;
};
