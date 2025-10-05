import React from 'react';
import { FileText, Monitor, Bot } from 'lucide-react';
import { LLMSettings, LLMModels, LLMConfig } from '../types';
import ModelConfigItem from './ModelConfigItem';

interface ModelConfigSectionProps {
  llmSettings: LLMSettings;
  availableModels: LLMModels;
  onUpdateConfig: (type: 'screenplay' | 'scene' | 'chat', config: Partial<LLMConfig>) => void;
}

const ModelConfigSection: React.FC<ModelConfigSectionProps> = ({
  llmSettings,
  availableModels,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-6">
      <ModelConfigItem
        icon={<FileText className="h-5 w-5 text-primary" />}
        title="Screenplay Operations"
        config={llmSettings.screenplay}
        availableModels={availableModels}
        onUpdate={(config) => onUpdateConfig('screenplay', config)}
      />

      <ModelConfigItem
        icon={<Monitor className="h-5 w-5 text-primary" />}
        title="Scene Operations"
        config={llmSettings.scene}
        availableModels={availableModels}
        onUpdate={(config) => onUpdateConfig('scene', config)}
      />

      <ModelConfigItem
        icon={<Bot className="h-5 w-5 text-primary" />}
        title="Chat Assistant"
        config={llmSettings.chat}
        availableModels={availableModels}
        onUpdate={(config) => onUpdateConfig('chat', config)}
      />
    </div>
  );
};

export default ModelConfigSection;
