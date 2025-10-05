/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate project name
 */
export const isValidProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Project name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Project name must be at least 2 characters long' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Project name must be less than 100 characters' };
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Project name contains invalid characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate scene number
 */
export const isValidSceneNumber = (sceneNumber: number): boolean => {
  return Number.isInteger(sceneNumber) && sceneNumber > 0;
};

/**
 * Validate character name
 */
export const isValidCharacterName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Character name is required' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Character name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate location name
 */
export const isValidLocationName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Location name is required' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Location name must be less than 100 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate time of day
 */
export const isValidTimeOfDay = (timeOfDay: string): boolean => {
  const validTimes = ['day', 'night', 'dawn', 'dusk', 'continuous'];
  return validTimes.includes(timeOfDay.toLowerCase());
};

/**
 * Validate location type
 */
export const isValidLocationType = (type: string): boolean => {
  return type === 'interior' || type === 'exterior';
};

/**
 * Validate API key format (basic validation)
 */
export const isValidApiKey = (apiKey: string): { isValid: boolean; error?: string } => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }
  
  if (apiKey.length < 10) {
    return { isValid: false, error: 'API key appears to be too short' };
  }
  
  if (apiKey.length > 200) {
    return { isValid: false, error: 'API key appears to be too long' };
  }
  
  return { isValid: true };
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate required field
 */
export const isRequired = (value: any): { isValid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'This field is required' };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: 'This field is required' };
  }
  
  return { isValid: true };
};

/**
 * Validate string length
 */
export const isValidLength = (
  value: string, 
  min: number, 
  max: number
): { isValid: boolean; error?: string } => {
  if (value.length < min) {
    return { isValid: false, error: `Must be at least ${min} characters long` };
  }
  
  if (value.length > max) {
    return { isValid: false, error: `Must be less than ${max} characters long` };
  }
  
  return { isValid: true };
};

export default {
  isValidEmail,
  isValidProjectName,
  isValidSceneNumber,
  isValidCharacterName,
  isValidLocationName,
  isValidTimeOfDay,
  isValidLocationType,
  isValidApiKey,
  isValidUrl,
  isInRange,
  isRequired,
  isValidLength
}; 