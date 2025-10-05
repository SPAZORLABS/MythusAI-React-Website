import React from 'react';
import { RefreshCw, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface APIKeyInputProps {
  provider: 'openai' | 'gemini';
  label: string;
  placeholder: string;
  value: string;
  testResult?: boolean;
  isTesting: boolean;
  onUpdate: (provider: 'openai' | 'gemini', value: string) => void;
  onTest: (provider: 'openai' | 'gemini') => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({
  provider,
  label,
  placeholder,
  value,
  testResult,
  isTesting,
  onUpdate,
  onTest
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex space-x-2">
        <input
          type="password"
          className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onUpdate(provider, e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTest(provider)}
          disabled={!value || isTesting}
          className="flex items-center space-x-1"
        >
          {isTesting ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <TestTube className="h-3 w-3" />
          )}
          <span>Test</span>
        </Button>
      </div>
      {testResult !== undefined && (
        <div className={`flex items-center space-x-1 text-xs ${
          testResult ? 'text-green-600' : 'text-red-600'
        }`}>
          {testResult ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          <span>{testResult ? 'Valid' : 'Invalid'}</span>
        </div>
      )}
    </div>
  );
};

export default APIKeyInput;
