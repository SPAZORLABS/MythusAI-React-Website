import axios, { AxiosProgressEvent } from 'axios';
import { Scene, Character, Location } from '@/types';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'your-api-key';

// Create API client with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

// Types for API responses
interface ProcessingOptions {
  extractScenes: boolean;
  extractCharacters: boolean;
  extractLocations: boolean;
  extractProps: boolean;
  extractVehicles: boolean;
  extractCostumes: boolean;
  extractMakeup: boolean;
  extractEquipment: boolean;
  extractSpecialEffects: boolean;
  extractSoundEffects: boolean;
  extractAnimals: boolean;
  extractExtras: boolean;
  generateBreakdown: boolean;
}

interface ProcessScriptPayload {
  scriptContent: string;
  options: ProcessingOptions;
}

interface JobResponse {
  jobId: string;
}

interface JobStatusResponse {
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: ProcessedScriptData;
  error?: string;
}

interface ProcessedScriptData {
  scenes: Scene[];
  characters: Character[];
  locations: Location[];
  props: string[];
  vehicles: string[];
  costumes: string[];
  makeup: string[];
  equipment: string[];
  specialEffects: string[];
  soundEffects: string[];
  animals: string[];
  extras: string[];
  breakdown: {
    totalScenes: number;
    totalCharacters: number;
    totalLocations: number;
    interiorScenes: number;
    exteriorScenes: number;
    dayScenes: number;
    nightScenes: number;
  };
}

interface CallSheetConfig {
  date: string;
  location: string;
  scenes: string[];
  [key: string]: any;
}

type ProgressCallback = (progress: number) => void;

/**
 * Process a PDF script to extract scenes, characters, and production elements
 */
export const processPdfScript = async (
  scriptContent: string, 
  progressCallback?: ProgressCallback
): Promise<ProcessedScriptData> => {
  try {
    // For development/testing purposes, we can simulate the API call
    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true') {
      return await mockProcessScript(progressCallback);
    }
    
    // Prepare request payload
    const payload: ProcessScriptPayload = {
      scriptContent,
      options: {
        extractScenes: true,
        extractCharacters: true,
        extractLocations: true,
        extractProps: true,
        extractVehicles: true,
        extractCostumes: true,
        extractMakeup: true,
        extractEquipment: true,
        extractSpecialEffects: true,
        extractSoundEffects: true,
        extractAnimals: true,
        extractExtras: true,
        generateBreakdown: true
      }
    };
    
    // Make API request with progress tracking
    const response = await apiClient.post<ProcessedScriptData | JobResponse>('/process-script', payload, {
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded * 0.2) / progressEvent.total);
          progressCallback?.(uploadProgress);
        }
      }
    });
    
    // Handle polling for processing status if the API works asynchronously
    if ('jobId' in response.data) {
      const result = await pollJobStatus(response.data.jobId, progressCallback);
      return result;
    }
    
    // If the API returns results directly
    progressCallback?.(1); // 100% complete
    return response.data as ProcessedScriptData;
  } catch (error: any) {
    console.error('Error processing script:', error);
    throw new Error(error.response?.data?.message || 'Failed to process script');
  }
};

/**
 * Poll for job status until complete
 */
const pollJobStatus = async (
  jobId: string, 
  progressCallback?: ProgressCallback
): Promise<ProcessedScriptData> => {
  let isComplete = false;
  let result: ProcessedScriptData | null = null;
  let pollCount = 0;
  
  while (!isComplete) {
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Check job status
      const response = await apiClient.get<JobStatusResponse>(`/job-status/${jobId}`);
      
      // Update progress
      if (progressCallback && response.data.progress) {
        // Scale progress to 20%-95% range (upload was 0-20%, final processing will be 95-100%)
        const scaledProgress = 0.2 + (response.data.progress * 0.75);
        progressCallback(scaledProgress);
      }
      
      // Check if job is complete
      if (response.data.status === 'completed') {
        isComplete = true;
        result = response.data.result!;
      } else if (response.data.status === 'failed') {
        throw new Error(response.data.error || 'Processing failed');
      }
      
      // Safety check to prevent infinite polling
      pollCount++;
      if (pollCount > 30) { // 1 minute timeout (30 * 2 seconds)
        throw new Error('Processing timeout');
      }
    } catch (error: any) {
      console.error('Error polling job status:', error);
      throw new Error(error.response?.data?.message || 'Failed to process script');
    }
  }
  
  return result!;
};

/**
 * Generate a call sheet from processed script data
 */
export const generateCallSheet = async (
  breakdownData: ProcessedScriptData, 
  callSheetConfig: CallSheetConfig
): Promise<any> => {
  try {
    // Prepare request payload
    const payload = {
      breakdownData,
      callSheetConfig
    };
    
    // Make API request
    const response = await apiClient.post('/generate-call-sheet', payload);
    
    return response.data;
  } catch (error: any) {
    console.error('Error generating call sheet:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate call sheet');
  }
};

/**
 * Mock function to simulate script processing (for development/testing)
 */
const mockProcessScript = async (progressCallback?: ProgressCallback): Promise<ProcessedScriptData> => {
  // Simulate processing time and progress updates
  const updateProgress = async (progress: number) => {
    progressCallback?.(progress);
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  // Simulate the various processing stages
  await updateProgress(0.1);  // 10%
  await updateProgress(0.3);  // 30%
  await updateProgress(0.5);  // 50%
  await updateProgress(0.7);  // 70%
  await updateProgress(0.9);  // 90%
  
  // Sample response data
  const mockData: ProcessedScriptData = {
    scenes: [
      {
        id: 'scene-1',
        sceneNumber: 1,
        heading: 'INT. OFFICE - DAY',
        content: 'John enters the office and greets Sarah.',
        timeOfDay: 'day',
        location: 'Office',
        characters: ['char-1', 'char-2'],
        pages: 1,
        notes: ''
      },
      {
        id: 'scene-2',
        sceneNumber: 2,
        heading: 'EXT. PARK - DAY',
        content: 'John and Sarah have a serious conversation.',
        timeOfDay: 'day',
        location: 'Park',
        characters: ['char-1', 'char-2'],
        pages: 2,
        notes: ''
      },
      {
        id: 'scene-3',
        sceneNumber: 3,
        heading: 'INT. RESTAURANT - NIGHT',
        content: 'John meets with Michael to discuss the plan.',
        timeOfDay: 'night',
        location: 'Restaurant',
        characters: ['char-1', 'char-3', 'char-4'],
        pages: 1.5,
        notes: ''
      }
    ],
    characters: [
      {
        id: 'char-1',
        name: 'John',
        description: 'Main character, 30s, professional',
        scenes: ['scene-1', 'scene-2', 'scene-3'],
        notes: ''
      },
      {
        id: 'char-2',
        name: 'Sarah',
        description: 'Supporting character, 30s, colleague',
        scenes: ['scene-1', 'scene-2'],
        notes: ''
      },
      {
        id: 'char-3',
        name: 'Michael',
        description: 'Supporting character, 40s, businessman',
        scenes: ['scene-3'],
        notes: ''
      },
      {
        id: 'char-4',
        name: 'Waiter',
        description: 'Minor character',
        scenes: ['scene-3'],
        notes: ''
      }
    ],
    locations: [
      {
        id: 'loc-1',
        name: 'Office',
        type: 'interior',
        scenes: ['scene-1'],
        notes: ''
      },
      {
        id: 'loc-2',
        name: 'Park',
        type: 'exterior',
        scenes: ['scene-2'],
        notes: ''
      },
      {
        id: 'loc-3',
        name: 'Restaurant',
        type: 'interior',
        scenes: ['scene-3'],
        notes: ''
      }
    ],
    props: [
      'Briefcase',
      'Coffee cup',
      'Park bench',
      'Phone',
      'Wine glasses',
      'Menu',
      'Envelope'
    ],
    vehicles: [],
    costumes: [],
    makeup: [],
    equipment: [],
    specialEffects: [],
    soundEffects: [],
    animals: [],
    extras: ['Restaurant patrons'],
    breakdown: {
      totalScenes: 3,
      totalCharacters: 4,
      totalLocations: 3,
      interiorScenes: 2,
      exteriorScenes: 1,
      dayScenes: 2,
      nightScenes: 1
    }
  };
  
  // Final progress update
  progressCallback?.(1); // 100% complete
  
  return mockData;
};

export default {
  processPdfScript,
  generateCallSheet
}; 