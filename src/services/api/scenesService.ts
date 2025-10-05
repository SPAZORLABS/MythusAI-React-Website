import axiosClient from '@/api/axiosClient';

export interface Scene {
  scene_id: string;
  scene_number: string;
  header: string;
  body_preview: string;
  body_length: number;
  is_truncated: boolean;
}

export interface SceneDetail {
  scene_id: string;
  scene_number: string;
  header: string;
  body: string;
  created_at: string;
  word_count: number;
  character_count: number;
  int_ext: string;
  day_night: string;
  set_name: string;
  page_num: number;
  page_eighths: number;
  synopsis: string;
  script_day: number;
  sequence: number;
  est_minutes: number;
  comment: string;
  location: string;
}

export interface SceneContext {
  previous_scene?: {
    scene_id: string;
    scene_number: string;
    header: string;
  };
  next_scene?: {
    scene_id: string;
    scene_number: string;
    header: string;
  };
  position: number;
  total_scenes: number;
}

export interface ScenesListResponse {
  screenplay_id: string;
  scenes: Scene[];
  pagination: {
    page: number;
    limit: number;
    total_scenes: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface SceneDetailResponse {
  success: boolean;
  data: {
    scene_number: string;
    header: string;
    body: string;
    context: SceneContext;
    int_ext: string;
    day_night: string;
    set_name: string;
    page_num: number;
    page_eighths: number;
    synopsis: string;
    script_day: number;
    sequence: number;
    est_minutes: number;
    comment: string;
    location: string;
  };
}

export interface BatchScenesResponse {
  screenplay_id: string;
  requested_scenes: string[];
  found_scenes: number;
  scenes: Array<{
    scene_number: string;
    header: string;
    body: string;
  }>;
}

export interface SceneLookupResponse {
  success: boolean;
  data: {
    int_ext_labels: string[];
    day_night_labels: string[];
    sets: string[];
  };
}

export interface SceneUpdateRequest {
  scene_number: string;
  header: string;
  body: string;
  int_ext: string;
  day_night: string;
  set_name: string;
  page_num: number;
  page_eighths: number;
  synopsis: string;
  script_day: number;
  sequence: number;
  est_minutes: number;
  comment: string;
  location: string;
}

export interface AddSceneRequest {
  scene_number: string;
  header: string;
  body: string;
  position: 'start' | 'end' | 'after';
  after_scene_number?: string;
}

export interface AddSceneResponse {
  success: boolean;
  message: string;
  scene_id: string;
  scene_number: string;
}

class ScenesService {
  private api = axiosClient;

  // Get scenes summary with pagination
  async getScenesSummary(
    screenplayId: string,
    page: number = 1,
    limit: number = 20,
    truncateBody: number = 150
  ): Promise<ScenesListResponse> {
    const response = await this.api.get(
      `/scene-management/${screenplayId}/scenes/summary?page=${page}&limit=${limit}&truncate_body=${truncateBody}`
    );
    if (
      !response ||
      typeof response !== 'object' ||
      !('data' in response) ||
      typeof response.data !== 'object' ||
      !response.data ||
      !('data' in response.data)
    ) {
      throw new Error('Invalid response structure from getScenesSummary');
    }
    return response.data.data as ScenesListResponse;
  }

  // Get scene detail
  async getSceneDetail(screenplayId: string, sceneId: string): Promise<SceneDetailResponse> {
    const response = await this.api.get(`/scene-management/${screenplayId}/scene/${sceneId}/metadata`);
    return response.data as SceneDetailResponse;
  }

  // Get batch scenes
  async getBatchScenes(screenplayId: string, sceneNumbers: string[]): Promise<BatchScenesResponse> {
    const sceneNumbersParam = sceneNumbers.join(',');
    const response = await this.api.get(`/scene-management/${screenplayId}/scenes/batch?scene_numbers=${sceneNumbersParam}`);
    return response.data as BatchScenesResponse;
  }

  // Get available lookup values for scenes
  async getAvailableLookupValues(screenplayId: string): Promise<SceneLookupResponse> {
    const response = await this.api.get(`/scene-management/${screenplayId}/lookup-values`);
    return response.data as SceneLookupResponse;
  }

  // Update scene details
  async updateScene(
    screenplayId: string, 
    sceneId: string, 
    updateData: SceneUpdateRequest
  ): Promise<SceneDetailResponse> {
    const response = await this.api.put(`/scene-management/${screenplayId}/scenes/${sceneId}/update`, updateData);
    return response.data as SceneDetailResponse;
  }

  // Add new scene
  async addScene(
    screenplayId: string,
    sceneData: AddSceneRequest
  ): Promise<AddSceneResponse> {
    const response = await this.api.post(`/scene-management/${screenplayId}/scenes/add`, sceneData);
    return response.data as AddSceneResponse;
  }

  // Delete scene
  async deleteScene(screenplayId: string, sceneId: string): Promise<void> {
    await this.api.delete(`/scene-management/${screenplayId}/scenes/${sceneId}`);
  }

  // Format word count for display
  formatWordCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k words`;
    }
    return `${count} words`;
  }

  // Format character count for display
  formatCharacterCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k chars`;
    }
    return `${count} chars`;
  }

  getSceneType(header: string): 'EXT' | 'INT' | 'Other' {
    const upperHeader = header.toUpperCase();
    if (upperHeader.startsWith('EXT.')) return 'EXT';
    if (upperHeader.startsWith('INT.')) return 'INT';
    return 'Other';
  }

  // Get scene location from header
  getSceneLocation(header: string): string {
    // Extract location from headers like "EXT. PRIDE ROCK - DAY 1"
    const match = header.match(/^(EXT\.|INT\.)\s*([^-]+)/i);
    if (match && match[2]) {
      return match[2].trim();
    }
    return 'Unknown Location';
  }

  // Get time of day from header
  getTimeOfDay(header: string): string {
    const upperHeader = header.toUpperCase();
    if (upperHeader.includes('DAY')) return 'Day';
    if (upperHeader.includes('NIGHT')) return 'Night';
    if (upperHeader.includes('DAWN')) return 'Dawn';
    if (upperHeader.includes('DUSK')) return 'Dusk';
    if (upperHeader.includes('MORNING')) return 'Morning';
    if (upperHeader.includes('EVENING')) return 'Evening';
    if (upperHeader.includes('CONTINUOUS')) return 'Continuous';
    return 'Unknown';
  }

  // Search scenes by content
  searchScenes(scenes: Scene[], query: string): Scene[] {
    if (!query.trim()) return scenes;
    
    const lowercaseQuery = query.toLowerCase();
    return scenes.filter(scene => 
      scene.header.toLowerCase().includes(lowercaseQuery) ||
      scene.body_preview.toLowerCase().includes(lowercaseQuery) ||
      scene.scene_number.includes(query)
    );
  }
}

export const scenesService = new ScenesService(); 