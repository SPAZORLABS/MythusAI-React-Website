import React from 'react';
import { LLMConfig, LLMModels } from '../types';

interface ModelConfigItemProps {
  icon: React.ReactNode;
  title: string;
  config: LLMConfig;
  availableModels: LLMModels;
  onUpdate: (config: Partial<LLMConfig>) => void;
}

const ModelConfigItem: React.FC<ModelConfigItemProps> = ({
  icon,
  title,
  config,
  availableModels,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {icon}
        <h4 className="text-md font-semibold">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Provider</label>
          <select
            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
            value={config.provider}
            onChange={(e) => onUpdate({ provider: e.target.value as 'openai' | 'gemini' })}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Model</label>
          <select
            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
            value={config.model_name}
            onChange={(e) => onUpdate({ model_name: e.target.value })}
          >
            {availableModels.providers[config.provider]?.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigItem;
