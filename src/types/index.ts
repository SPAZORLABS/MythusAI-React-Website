// Project related types
export interface Project {
  id: string;
  name: string;
  description?: string;
  scriptContent?: string;
  scriptFileName?: string;
  createdAt: string;
  updatedAt: string;
  breakdown?: {
    characters: Character[];
    locations: Location[];
    scenes: Scene[];
  };
  settings?: ProjectSettings;
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  age?: string;
  gender?: string;
  scenes: string[]; // scene IDs
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'interior' | 'exterior';
  description?: string;
  scenes: string[]; // scene IDs
  notes?: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  heading: string;
  content: string;
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk' | 'continuous';
  location: string;
  characters: string[]; // character IDs
  pages?: number;
  notes?: string;
}

export interface ProjectSettings {
  llmProvider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// LLM Configuration Types
export interface LLMConfig {
  provider: 'openai' | 'gemini';
  model_name: string;
  temperature: number;
  max_tokens?: number | null;
  top_p?: number | null;
  timeout: number;
  api_key?: string | null;
}

export interface LLMModels {
  providers: {
    openai: string[];
    gemini: string[];
  };
  default_config: LLMConfig;
}

export interface LLMTestResponse {
  provider: string;
  model_name: string;
  available: boolean;
  error_message?: string | null;
}

export interface LLMValidationResponse {
  success: boolean;
  message: string;
  config: LLMConfig;
}

export interface LLMCacheInfo {
  hits: number;
  misses: number;
  current_size: number;
  max_size: number;
}

export interface LLMCacheResponse {
  success: boolean;
  cache_info: LLMCacheInfo;
}

// Settings for different use cases
export interface LLMSettings {
  // Default models for screenplay/scene operations
  screenplay: LLMConfig;
  scene: LLMConfig;
  // Chat model (separate from screenplay/scene)
  chat: LLMConfig;
  // API Keys
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
}

// Context types
export interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  isElectronReady: boolean;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  loadProject: (projectId: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<boolean>;
  clearCurrentProject: () => void;
  setError: (error: string | null) => void;
}

// Electron window interface
declare global {
  interface Window {
    electron?: {
      ipc: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        receive: (channel: string, callback: Function) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
} 

export type ProductionInfo = {
  // Basic Information
  company_name?: string;
  production_number?: string;
  title?: string;
  company_address?: string;
  genre?: string;
  production_status?: string;
  shoot_start_date?: string; // ISO date string
  shoot_end_date?: string;   // ISO date string
  
  // Key Personnel
  director_name?: string;
  producer_names?: string[];
  writer_names?: string[];
  executive_producer?: string;
  line_producer_name?: string;
  unit_production_manager?: string;
  production_accountant?: string;
  assistant_directors?: string[];
  
  // Technical Crew
  director_of_photography?: string;
  first_assistant_camera?: string;
  focus_puller_1?: string;
  focus_puller_2?: string;
  gaffer?: string;
  on_set_editor?: string;
  
  // Art Department
  production_designer?: string;
  art_director?: string;
  assistant_art_director?: string;
  art_team?: string;
  
  // Other Departments
  wardrobe_department?: string;
  makeup_hair_department?: string;
  action_director?: string;
  direction_department?: string;
  production_team?: string;
};

// Production Info Context Type (re-exported from context)
export type { ProductionInfoContextType } from '@/contexts/ProductionInfoContext';
