import axiosClient from '@/api/axiosClient';

export interface Screenplay {
  id: string;
  title: string;
  filename: string;
  created_at: string;
  scene_count: number;
}

export interface ScreenplayCreateRequest {
  success: boolean;
  screenplay_id: string;
  message: string;
}

export interface ScreenplayInfo {
  screenplay: {
    id: string;
    filename: string;
    created_at: string;
  };
  statistics: {
    total_scenes: number;
    total_characters: number;
    avg_scene_length: number;
    min_scene_length: number;
    max_scene_length: number;
    scene_types: {
      Exterior: number;
      Interior: number;
      Other: number;
    };
  };
}

export interface ScreenplayListResponse {
  screenplays: Screenplay[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

class ScreenplayService {
  private api = axiosClient;

  // Get list of screenplays with pagination
  async getScreenplays(page: number = 1, limit: number = 10): Promise<ScreenplayListResponse> {
    const response = await this.api.get(`/screenplay/list?page=${page}&limit=${limit}`);
    return response.data as ScreenplayListResponse;
  }

  async createScreenplay(title: string): Promise<ScreenplayCreateRequest> {
    const response = await this.api.post(`/screenplay/create/${title}`);
    return response.data as ScreenplayCreateRequest;
  }

  // Get all screenplays (for sidebar)
  async getAllScreenplays(): Promise<Screenplay[]> {
    const response = await this.api.get(`/screenplay/list?page=1&limit=20`);
    const data = response.data as ScreenplayListResponse;
    return data.screenplays as Screenplay[];
  }

  // Get screenplay info
  async getScreenplayInfo(id: string): Promise<ScreenplayInfo> {
    const response = await this.api.get(`/screenplay/${id}/info`);
    return response.data as ScreenplayInfo;
  }

  // Delete screenplay
  async deleteScreenplay(id: string): Promise<void> {
    await this.api.delete(`/screenplay/${id}`);
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get relative time (e.g., "2 days ago")
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}

export const screenplayService = new ScreenplayService(); 