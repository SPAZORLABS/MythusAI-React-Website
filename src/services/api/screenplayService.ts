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

  private shouldMock(error?: any): boolean {
    const mockEnabled = import.meta.env.VITE_MOCK_API === 'true';
    if (mockEnabled) return true;
    const msg = String(error?.message || '');
    return /ECONNREFUSED|ERR_NETWORK|Network Error/i.test(msg);
  }

  private mockScreenplays(): Screenplay[] {
    const now = new Date().toISOString();
    return [
      { id: 'sp-1', title: 'Demo Screenplay', filename: 'demo.pdf', created_at: now, scene_count: 12 },
      { id: 'sp-2', title: 'Sample Script', filename: 'sample.pdf', created_at: now, scene_count: 8 },
      { id: 'sp-3', title: 'Pilot Episode', filename: 'pilot.pdf', created_at: now, scene_count: 20 },
    ];
  }

  // Get list of screenplays with pagination
  async getScreenplays(page: number = 1, limit: number = 10): Promise<ScreenplayListResponse> {
    // In mock/dev mode, avoid firing network requests entirely
    if (this.shouldMock()) {
      const all = this.mockScreenplays();
      const start = (page - 1) * limit;
      const items = all.slice(start, start + limit);
      return {
        screenplays: items,
        pagination: {
          page,
          limit,
          total_count: all.length,
          total_pages: Math.ceil(all.length / limit),
          has_next: start + limit < all.length,
          has_prev: page > 1,
        },
      };
    }
    try {
      const response = await this.api.get(`/screenplay/list?page=${page}&limit=${limit}`);
      return response.data as ScreenplayListResponse;
    } catch (error) {
      if (this.shouldMock(error)) {
        const all = this.mockScreenplays();
        const start = (page - 1) * limit;
        const items = all.slice(start, start + limit);
        return {
          screenplays: items,
          pagination: {
            page,
            limit,
            total_count: all.length,
            total_pages: Math.ceil(all.length / limit),
            has_next: start + limit < all.length,
            has_prev: page > 1,
          },
        };
      }
      throw error;
    }
  }

  async createScreenplay(title: string): Promise<ScreenplayCreateRequest> {
    // In mock/dev mode, avoid network and synthesize a screenplay ID
    if (this.shouldMock()) {
      const mockId = `sp-${Date.now()}`;
      return {
        success: true,
        screenplay_id: mockId,
        message: 'Mock screenplay created'
      };
    }
    const response = await this.api.post(`/screenplay/create/${title}`);
    return response.data as ScreenplayCreateRequest;
  }

  // Get all screenplays (for sidebar)
  async getAllScreenplays(): Promise<Screenplay[]> {
    // In mock/dev mode, avoid network and return demo data
    if (this.shouldMock()) {
      return this.mockScreenplays();
    }
    try {
      const response = await this.api.get(`/screenplay/list?page=1&limit=20`);
      const data = response.data as ScreenplayListResponse;
      return data.screenplays as Screenplay[];
    } catch (error) {
      if (this.shouldMock(error)) {
        return this.mockScreenplays();
      }
      throw error;
    }
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
