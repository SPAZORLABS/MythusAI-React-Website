import React from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface LLMConfig {
  provider: 'openai' | 'gemini';
  model_name: string;
  temperature: number;
  timeout: number;
  api_key: string | null;
}

export interface LLMSettings {
  screenplay: LLMConfig;
  scene: LLMConfig;
  chat: LLMConfig;
  apiKeys: {
    openai: string;
    gemini: string;
  };
}

export interface LLMModels {
  providers: {
    openai: string[];
    gemini: string[];
  };
}
