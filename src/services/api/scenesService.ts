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

  // Determine whether to use mock data (dev/offline)
  private shouldMock(error?: any): boolean {
    const mockEnabled = import.meta.env.VITE_MOCK_API === 'true';
    if (mockEnabled) return true;
    const msg = String(error?.message || '');
    return /ECONNREFUSED|ERR_NETWORK|Network Error/i.test(msg);
  }

  // Get scenes summary with pagination
  async getScenesSummary(
    screenplayId: string,
    page: number = 1,
    limit: number = 20,
    truncateBody: number = 150
  ): Promise<ScenesListResponse> {
    try {
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
    } catch (err: any) {
      if (!this.shouldMock(err)) throw err;

      // Mocked scenes summary for dev/offline usage
      const mockScenes = [
        {
          scene_id: 'scene-1',
          scene_number: '1',
          header: 'INT. OFFICE - DAY',
          body_preview: 'John enters the office and greets Sarah...',
          body_length: 64,
          is_truncated: false,
        },
        {
          scene_id: 'scene-2',
          scene_number: '2',
          header: 'EXT. PARK - DAY',
          body_preview: 'John and Sarah have a serious conversation...',
          body_length: 82,
          is_truncated: false,
        },
        {
          scene_id: 'scene-3',
          scene_number: '3',
          header: 'INT. RESTAURANT - NIGHT',
          body_preview: 'John meets with Michael to discuss the plan...',
          body_length: 73,
          is_truncated: false,
        },
      ];

      return {
        screenplay_id: screenplayId,
        scenes: mockScenes,
        // Provide total_scenes at top-level to satisfy current consumers
        // while also including pagination details.
        // @ts-expect-error extra field for convenience
        total_scenes: mockScenes.length,
        pagination: {
          page: 1,
          limit: limit,
          total_scenes: mockScenes.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      } as unknown as ScenesListResponse;
    }
  }

  // Get scene detail
  async getSceneDetail(screenplayId: string, sceneId: string): Promise<SceneDetailResponse> {
    try {
      const response = await this.api.get(`/scene-management/${screenplayId}/scene/${sceneId}/metadata`);
      return response.data as SceneDetailResponse;
    } catch (err: any) {
      if (!this.shouldMock(err)) throw err;

      // Basic mock detail derived from sceneId
      const detailMap: Record<string, { header: string; body: string }> = {
        'scene-1': {
          header: 'INT. OFFICE - DAY',
          body: 'John enters the office and greets Sarah. They discuss the plan briefly.',
        },
        'scene-2': {
          header: 'EXT. PARK - DAY',
          body: 'John and Sarah walk through the park, debating their next move.',
        },
        'scene-3': {
          header: 'INT. RESTAURANT - NIGHT',
          body: 'John meets Michael. The atmosphere is tense as they outline the plan.',
        },
      };

      const fallback = detailMap[sceneId] || {
        header: 'INT. UNKNOWN - DAY',
        body: 'Placeholder scene body for offline mode.',
      };

      const inferType = (header: string) => {
        const upper = header.toUpperCase();
        if (upper.startsWith('EXT.')) return 'EXT';
        if (upper.startsWith('INT.')) return 'INT';
        return 'Other';
      };
      const inferDayNight = (header: string) => {
        const upper = header.toUpperCase();
        if (upper.includes('NIGHT')) return 'Night';
        if (upper.includes('DAY')) return 'Day';
        return 'Unknown';
      };

      return {
        success: true,
        data: {
          scene_number: sceneId.replace('scene-', ''),
          header: fallback.header,
          body: fallback.body,
          context: {
            previous_scene: undefined,
            next_scene: undefined,
            position: Number(sceneId.replace('scene-', '')) || 1,
            total_scenes: 3,
          },
          int_ext: inferType(fallback.header),
          day_night: inferDayNight(fallback.header),
          set_name: fallback.header.split('-')[0].trim(),
          page_num: 1,
          page_eighths: 8,
          synopsis: 'Offline mock synopsis',
          script_day: 1,
          sequence: 1,
          est_minutes: 2,
          comment: '',
          location: 'Mock Location',
        },
      } as SceneDetailResponse;
    }
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