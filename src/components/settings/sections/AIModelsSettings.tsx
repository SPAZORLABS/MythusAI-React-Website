// AIModelsSettings.tsx (replace local useState with persisted hook)
import React from 'react';
import AIModelsHeader from '../components/AIModelsHeader';
import APIKeysSection from '../components/APIKeysSection';
import ModelConfigSection from '../components/ModelConfigSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLLMSettings } from '@/hooks/useLLMSettings';
import { llmConfigService } from '@/services/api/llmConfigService';
import { LLMModels, LLMConfig } from '../types';
import { LLMSettings } from '@/types/electron';

const AIModelsSettings: React.FC = () => {
  const { settings, loading, save, setApiKey, getApiKey } = useLLMSettings();
  const [availableModels, setAvailableModels] = React.useState<LLMModels | null>(null);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);
  const [isTestingApiKey, setIsTestingApiKey] = React.useState<string | null>(null);
  const [apiKeyTestResults, setApiKeyTestResults] = React.useState<{[k: string]: boolean}>({});

  React.useEffect(() => {
    (async () => {
      setIsLoadingModels(true);
      try {
        const models = await llmConfigService.getAvailableModels();
        setAvailableModels(models);
      } finally {
        setIsLoadingModels(false);
      }
    })();
  }, []);

  const handleApiKeyTest = async (provider: 'openai' | 'gemini') => {
    const apiKey = await getApiKey(provider);
    if (!apiKey) return;
    setIsTestingApiKey(provider);
    try {
      const isValid = await llmConfigService.testApiKey(provider, apiKey);
      setApiKeyTestResults(prev => ({ ...prev, [provider]: isValid }));
    } finally {
      setIsTestingApiKey(null);
    }
  };

  const updateApiKey = async (provider: 'openai' | 'gemini', apiKey: string) => {
    await setApiKey(provider, apiKey);
    setApiKeyTestResults(prev => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });
  };

  const updateLlmConfig = async (type: 'screenplay' | 'scene' | 'chat', config: Partial<LLMConfig>) => {
    if (!settings) return;
    await save({ [type]: { ...settings[type], ...config } } as Partial<LLMSettings>);
  };

  if (loading || isLoadingModels || !settings) {
    return <LoadingSpinner message="Loading available models..." />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <AIModelsHeader />
      <div className="space-y-8">
        <APIKeysSection
          apiKeys={{ openai: '', gemini: '' }} // no plaintext in UI state
          testResults={apiKeyTestResults}
          isTestingApiKey={isTestingApiKey}
          onUpdateApiKey={updateApiKey}
          onTestApiKey={handleApiKeyTest}
        />
        {availableModels && (
          <ModelConfigSection
            llmSettings={{
              screenplay: { ...settings.screenplay, api_key: '' },
              scene: { ...settings.scene, api_key: '' },
              chat: { ...settings.chat, api_key: '' },
              apiKeys: { openai: '', gemini: '' }
            }}
            availableModels={availableModels}
            onUpdateConfig={updateLlmConfig}
          />
        )}
      </div>
    </div>
  );
};

export default AIModelsSettings;
