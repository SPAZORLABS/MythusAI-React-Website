import React from 'react';
import { Key } from 'lucide-react';
import APIKeyInput from './APIKeyInput';

interface APIKeysSectionProps {
  apiKeys: { openai: string; gemini: string };
  testResults: { [key: string]: boolean };
  isTestingApiKey: string | null;
  onUpdateApiKey: (provider: 'openai' | 'gemini', apiKey: string) => void;
  onTestApiKey: (provider: 'openai' | 'gemini') => void;
}

const APIKeysSection: React.FC<APIKeysSectionProps> = ({
  apiKeys,
  testResults,
  isTestingApiKey,
  onUpdateApiKey,
  onTestApiKey
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Key className="h-5 w-5 text-primary" />
        <h4 className="text-md font-semibold">API Keys</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <APIKeyInput
          provider="openai"
          label="OpenAI API Key"
          placeholder="sk-..."
          value={apiKeys.openai}
          testResult={testResults.openai}
          isTesting={isTestingApiKey === 'openai'}
          onUpdate={onUpdateApiKey}
          onTest={onTestApiKey}
        />

        <APIKeyInput
          provider="gemini"
          label="Gemini API Key"
          placeholder="AI..."
          value={apiKeys.gemini}
          testResult={testResults.gemini}
          isTesting={isTestingApiKey === 'gemini'}
          onUpdate={onUpdateApiKey}
          onTest={onTestApiKey}
        />
      </div>
    </div>
  );
};

export default APIKeysSection;
