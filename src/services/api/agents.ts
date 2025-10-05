import axiosClient from '@/api/axiosClient';
import { promises } from 'dns';

export interface SummarizeResponse {
  success: boolean;
  message: string;
  data: {
    screenplay_id: string;
    summary: any;
    next_steps: string[];
  };
  state: any;
  errors: any[];
}

export interface AutofillSceneResponse {
  success: boolean;
  message: string;
  data: {
    scene_config: {
      scene_number: number | null,
      header: string | null,
      body: string | null,
      synopsis: string | null,
      int_ext: string,
      day_night: string,
      set_name: string,
      location: string,
      script_day: string | null,
      est_minutes: number
    },
    scene_elements: {
      featured_artists: string[],
      extras: string[],
      costume_changes: string[],
      background_wardrobe: string[],
      hair_and_makeup: string[],
      action_props: string[],
      art_setup: string[],
      picture_vehicles: string[],
      background_vehicles: string[],
      action_weapons: string[],
      production_requirements: string[],
      special_equipment: string[]
    },
    was_first_scene: boolean,
    changes_written: {
      changes_made: string[],
      total_changes: number,
    }
  }
  state: any;
  errors: any[];
}

function mapUseCase(screenplayCall: boolean): 'screenplay' | 'scene' {
  return screenplayCall ? 'screenplay' : 'scene';
}

async function buildLLMConfigFor(useCase: 'screenplay' | 'scene' | 'chat') {
  const settings = await window.settings.getLLMSettings();
  const cfg = settings[useCase];
  const apiKey = await window.secrets.getApiKey(cfg.provider);
  return {
    provider: cfg.provider,
    model_name: cfg.model_name,
    temperature: cfg.temperature,
    top_p: cfg.top_p ?? null,
    timeout: cfg.timeout,
    api_key: apiKey ?? null,
  };
}

export class AgentsService {
  private api = axiosClient;

  async summarizeScreenplay(screenplay_id: string, force_refresh: boolean): Promise<SummarizeResponse> {
    const LLMConfig = await buildLLMConfigFor('screenplay');
    const response = await this.api.post(`/agents/screenplay/summarize`, {
      screenplay_id,
      force_refresh,
      LLMConfig,
    });
    return response.data as SummarizeResponse;
  }

  async getSummaryStatus(screenplay_id: string): Promise<{ hasExistingSummary: boolean; summary?: any }> {
    try {
      const response = await this.api.get(`/agents/screenplay/${screenplay_id}/summary`);
      return { hasExistingSummary: true, summary: response.data };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { hasExistingSummary: false };
      }
      throw error;
    }
  }

  async autofillScene(screenplay_id: string, scene_id: string, skip_human_review: boolean): Promise<AutofillSceneResponse> {
    const LLMConfig = await buildLLMConfigFor('scene');
    const response = await this.api.post(`/agents/scene/autofill`, {
      screenplay_id,
      scene_id,
      skip_human_review,
      LLMConfig,
    });
    return response.data as AutofillSceneResponse;
  }
}

export const agentsService = new AgentsService();
