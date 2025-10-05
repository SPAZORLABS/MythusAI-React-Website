import axiosClient from '@/api/axiosClient';

export interface MasterBreakdown {
  scene_number: string;
  int_ext: string;
  day_night: string;
  location: string;
  scene_summary: string;
  featured_artists: string[];
  extras: string[];
  costume_changes: string | null;
  background_wardrobe: string | null;
  hair_makeup: string;
  action_props: string[];
  art_setup: string;
  picture_vehicles: string[];
  background_vehicles: string[];
  action_weapons: string[];
  production_requirements: string;
  special_equipment: string[];
}

export interface MasterBreakdownResponse {
  success: boolean;
  scene_id: string;
  scene_elements: SceneElementBreakdown[];
  has_breakdown: boolean;
}

export interface SceneElementBreakdown {
  key: string;
  values: (string | number | null)[];
  available_values: (string | number | null)[];
}

export interface KeysValuesItem {
  key: string;
  available_values: (string | number | null)[];
}

export interface KeysValuesResponse {
  success: boolean;
  screenplay_id: string;
  data: KeysValuesItem[];
}

export interface ValueCountItem {
  value: string | number | null;
  count: number;
}

export interface ValueCountsByKey {
  key: string;
  values: ValueCountItem[];
}

export interface ValueCountsResponse {
  success: boolean;
  screenplay_id: string;
  data: ValueCountsByKey[];
}

export interface GridExportPayload {
  success: boolean;
  screenplay_id: string;
  columns: string[];
  rows: Array<{
    body?: string;
    day_night?: string;
    est_minutes?: number | string;
    header?: string;
    int_ext?: string;
    location?: string;
    page_eighths?: string;
    page_num?: string;
    scene_number?: string;
    screenplay_id?: string;
    set_name?: string;
    art_setup?: string;
    background_wardrobe?: string;
    extras?: string;
    featured_artists?: string;
    production_requirements?: string;
    special_equipment?: string;
    [key: string]: any; // Allow for additional dynamic fields
  }>;
}

export interface LongExportPayload {
  success: boolean;
  screenplay_id: string;
  columns: string[];
  rows: Array<{
    scene_id: string;
    scene_number?: string | number | null;
    sequence?: string | number | null;
    set_name?: string | null;
    element_key: string;
    element_value: string | number | null;
  }>;
}

export interface MergeUpsertResponse {
  success: boolean;
  message: string;
}

export interface AutoExtractResponse {
  success: boolean;
  screenplay_id: string;
  scene_id: string;
  proposed: Record<string, (string | number)[]>;
  applied_mode: 'merge' | 'replace';
}

class MasterBreakdownService {
  private api = axiosClient;

  // Legacy compatibility methods (adjust to your existing backend if still used)
  async getSceneBreakdown(screenplayId: string, sceneID: string): Promise<MasterBreakdownResponse> {
    const res = await this.api.get(`/master-breakdown/${screenplayId}/scenes/${sceneID}/elements:read`);
    if (res.data) {
      (res.data as MasterBreakdownResponse).scene_id = String((res.data as MasterBreakdownResponse).scene_id);
    }
    return res.data as MasterBreakdownResponse;
  }

  async getSceneBreakdownElements(screenplayId: string): Promise<MasterBreakdownResponse> {
    const res = await this.api.get(`/master-breakdown/${screenplayId}/elements`);
    return res.data as MasterBreakdownResponse;
  }

  async generateSceneBreakdown(screenplayId: string, sceneNumber: string): Promise<MasterBreakdownResponse> {
    const res = await this.api.post(`/master-breakdown/${screenplayId}/scenes/${sceneNumber}`);
    return res.data as MasterBreakdownResponse;
  }

  async updateSceneBreakdown(screenplayId: string, sceneNumber: string, breakdown: MasterBreakdown): Promise<MasterBreakdownResponse> {
    const res = await this.api.put(`/master-breakdown/${screenplayId}/scenes/${sceneNumber}`, { breakdown });
    return res.data as MasterBreakdownResponse;
  }

  // New routes aligned with optimized backend

  // 1) Keys and available values for dynamic dropdowns
  async listElementKeysValues(
    screenplayId: string,
    opts?: { include?: string[]; exclude?: string[]; limit?: number }
  ): Promise<KeysValuesResponse> {
    const params: Record<string, string | number> = {};
    if (opts?.include) params['include'] = opts.include.join(',');
    if (opts?.exclude) params['exclude'] = opts.exclude.join(',');
    if (opts?.limit) params['limit'] = opts.limit;
    const res = await this.api.get(`/master-breakdown/${screenplayId}/elements/keys-values`, { params });
    return res.data as KeysValuesResponse;
  }

  // 2) Value counts for ranking suggestions/autocomplete
  async listElementValueCounts(
    screenplayId: string,
    sample?: number
  ): Promise<ValueCountsResponse> {
    const params: Record<string, number> = {};
    if (sample && sample > 0) params.sample = sample;
    const res = await this.api.get(`/master-breakdown/${screenplayId}/elements/value-counts`, { params });
    return res.data as ValueCountsResponse;
  }

  // 3) Grid export (one row per scene; arrays CSV-joined)
  async exportGrid(screenplayId: string): Promise<GridExportPayload> {
    const res = await this.api.get(`/master-breakdown/${screenplayId}/export-grid`);
    return res.data as GridExportPayload;
  }

  // 4) Long export (one row per element item)
  async exportLong(screenplayId: string): Promise<LongExportPayload> {
    const res = await this.api.get(`/master-breakdown/${screenplayId}/export/long`);
    return res.data as LongExportPayload;
  }

  // 5) Merge upsert scene elements (dedupe array fields)
  async mergeSceneElements(
    screenplayId: string,
    sceneId: string,
    elements: Record<string, any>
  ): Promise<MergeUpsertResponse> {
    const res = await this.api.put(`/master-breakdown/${screenplayId}/scenes/${sceneId}/elements:merge`, elements);
    return res.data as MergeUpsertResponse;
  }

  // 6) Automation stub to auto-extract elements for a scene
  async autoExtractForScene(
    screenplayId: string,
    sceneId: string,
    overwrite = false
  ): Promise<AutoExtractResponse> {
    const res = await this.api.post(
      `/screenplays/${screenplayId}/scenes/${sceneId}/elements:auto-extract`,
      null,
      { params: { overwrite } }
    );
    return res.data as AutoExtractResponse;
  }

  // Helpers reused by UI
  formatArrayField(field: string[]): string {
    if (!field || field.length === 0) return '-';
    return field.join(', ');
  }

  formatTextField(field: string | null): string {
    if (!field || field.trim() === '') return '-';
    return field;
  }

  getBreakdownField(breakdown: MasterBreakdown, fieldKey: string): string {
    const value = breakdown[fieldKey as keyof MasterBreakdown] as any;
    if (Array.isArray(value)) return this.formatArrayField(value);
    if (typeof value === 'string' || value === null) return this.formatTextField(value);
    return String(value);
  }

  getBreakdownFields(): Array<{ key: keyof MasterBreakdown; label: string; width?: string }> {
    return [
      { key: 'int_ext', label: 'Int/Ext', width: '80px' },
      { key: 'day_night', label: 'Day/Night', width: '90px' },
      { key: 'location', label: 'Location', width: '150px' },
      { key: 'scene_summary', label: 'Summary', width: '200px' },
      { key: 'featured_artists', label: 'Featured Artists', width: '150px' },
      { key: 'extras', label: 'Extras', width: '100px' },
      { key: 'costume_changes', label: 'Costume Changes', width: '120px' },
      { key: 'background_wardrobe', label: 'Background Wardrobe', width: '140px' },
      { key: 'hair_makeup', label: 'Hair & Makeup', width: '150px' },
      { key: 'action_props', label: 'Action Props', width: '120px' },
      { key: 'art_setup', label: 'Art Setup', width: '150px' },
      { key: 'picture_vehicles', label: 'Picture Vehicles', width: '120px' },
      { key: 'background_vehicles', label: 'Background Vehicles', width: '140px' },
      { key: 'action_weapons', label: 'Action Weapons', width: '120px' },
      { key: 'production_requirements', label: 'Production Requirements', width: '180px' },
      { key: 'special_equipment', label: 'Special Equipment', width: '140px' },
    ];
  }

  // Helper method to format grid export data for display
  formatGridRow(row: GridExportPayload['rows'][0]): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    // Format each field in the row
    Object.entries(row).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        formatted[key] = '-';
      } else if (Array.isArray(value)) {
        formatted[key] = value.join(', ');
      } else {
        formatted[key] = String(value);
      }
    });
    
    return formatted;
  }

  // Helper method to get display-friendly column headers
  getDisplayColumnHeaders(): Record<string, string> {
    return {
      'scene_number': 'Scene #',
      'int_ext': 'Int/Ext',
      'day_night': 'Day/Night',
      'location': 'Location',
      'set_name': 'Set Name',
      'header': 'Header',
      'body': 'Body',
      'est_minutes': 'Est. Minutes',
      'page_num': 'Page #',
      'page_eighths': 'Page Eighths',
      'art_setup': 'Art Setup',
      'background_wardrobe': 'Background Wardrobe',
      'extras': 'Extras',
      'featured_artists': 'Featured Artists',
      'production_requirements': 'Production Requirements',
      'special_equipment': 'Special Equipment',
    };
  }
}

export const masterBreakdownService = new MasterBreakdownService();
