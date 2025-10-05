import axiosClient from '@/api/axiosClient';
import { 
  LLMConfig, 
  LLMModels, 
  LLMTestResponse, 
  LLMValidationResponse, 
  LLMCacheResponse 
} from '@/types';

class LLMConfigService {
  /**
   * Get available models from all providers
   */
  async getAvailableModels(): Promise<LLMModels> {
    const response = await axiosClient.get('/agents/llm/models');
    return response.data;
  }

  /**
   * Get default configuration
   */
  async getDefaultConfig(): Promise<LLMConfig> {
    const response = await axiosClient.get('/agents/llm/config/default');
    return response.data;
  }

  /**
   * Test model availability with given configuration
   */
  async testModel(config: LLMConfig): Promise<LLMTestResponse> {
    const response = await axiosClient.post('/agents/llm/test', config);
    return response.data;
  }

  /**
   * Validate configuration
   */
  async validateConfig(config: LLMConfig): Promise<LLMValidationResponse> {
    const response = await axiosClient.post('/agents/llm/config/validate', config);
    return response.data;
  }

  /**
   * Clear LLM cache
   */
  async clearCache(): Promise<{ success: boolean; message: string }> {
    const response = await axiosClient.post('/agents/llm/cache/clear');
    return response.data;
  }

  /**
   * Get cache information
   */
  async getCacheInfo(): Promise<LLMCacheResponse> {
    const response = await axiosClient.get('/agents/llm/cache/info');
    return response.data;
  }

  /**
   * Test API key for a specific provider
   */
  async testApiKey(provider: 'openai' | 'gemini', apiKey: string): Promise<boolean> {
    try {
      // Create a test config with the provided API key
      const testConfig: LLMConfig = {
        provider,
        model_name: provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash',
        temperature: 0.5,
        timeout: 30.0,
        api_key: apiKey
      };

      const result = await this.testModel(testConfig);
      return result.available;
    } catch (error) {
      console.error(`Failed to test ${provider} API key:`, error);
      return false;
    }
  }

  /**
   * Get model list for a specific provider
   */
  getModelsForProvider(provider: 'openai' | 'gemini', models: LLMModels): string[] {
    return models.providers[provider] || [];
  }

  /**
   * Check if a model has temperature restrictions
   */
  isTemperatureRestricted(modelName: string): boolean {
    const restrictedModels = ['gpt-5', 'gpt-4o'];
    return restrictedModels.includes(modelName);
  }

  /**
   * Get default temperature for a model
   */
  getDefaultTemperature(modelName: string): number {
    if (this.isTemperatureRestricted(modelName)) {
      return 1.0;
    }
    return 0.5;
  }
}

export const llmConfigService = new LLMConfigService();
