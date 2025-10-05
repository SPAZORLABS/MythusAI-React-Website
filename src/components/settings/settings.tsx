import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  User,
  Database,
  Palette,
  Bell,
  Shield,
  Globe,
  Monitor,
  FileText,
  Zap,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bot,
  Key,
  TestTube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '../theme/mode-toggle';
import { useAuth } from '@/auth/AuthProvider';
import { llmConfigService } from '@/services/api/llmConfigService';
import { LLMConfig, LLMModels, LLMSettings } from '@/types';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    icon: <SettingsIcon className="h-4 w-4" />
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: <User className="h-4 w-4" />
  },
  {
    id: 'ai-models',
    title: 'AI Models',
    icon: <Bot className="h-4 w-4" />,
    badge: 'New',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: 'security',
    title: 'Security',
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: 'data',
    title: 'Data & Storage',
    icon: <Database className="h-4 w-4" />,
  },
  {
    id: 'language',
    title: 'Language & Region',
    icon: <Globe className="h-4 w-4" />,
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: 'about',
    title: 'About',
    icon: <FileText className="h-4 w-4" />,
  },
];

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [isOpen, setIsOpen] = useState(false);
  
  // LLM Settings State
  const [llmSettings, setLlmSettings] = useState<LLMSettings>({
    screenplay: {
      provider: 'openai',
      model_name: 'gpt-4o-mini',
      temperature: 0.5,
      timeout: 30.0,
      api_key: null
    },
    scene: {
      provider: 'openai',
      model_name: 'gpt-4o-mini',
      temperature: 0.5,
      timeout: 30.0,
      api_key: null
    },
    chat: {
      provider: 'openai',
      model_name: 'gpt-4o-mini',
      temperature: 0.5,
      timeout: 30.0,
      api_key: null
    },
    apiKeys: {
      openai: '',
      gemini: ''
    }
  });
  const [availableModels, setAvailableModels] = useState<LLMModels | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isTestingApiKey, setIsTestingApiKey] = useState<string | null>(null);
  const [apiKeyTestResults, setApiKeyTestResults] = useState<{[key: string]: boolean}>({});
  
  const { user } = useAuth();

  // Load available models when AI Models section is opened
  useEffect(() => {
    if (activeSection === 'ai-models' && !availableModels) {
      loadAvailableModels();
    }
  }, [activeSection, availableModels]);

  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await llmConfigService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load available models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleApiKeyTest = async (provider: 'openai' | 'gemini') => {
    const apiKey = llmSettings.apiKeys[provider];
    if (!apiKey) return;

    setIsTestingApiKey(provider);
    try {
      const isValid = await llmConfigService.testApiKey(provider, apiKey);
      setApiKeyTestResults(prev => ({ ...prev, [provider]: isValid }));
    } catch (error) {
      console.error(`Failed to test ${provider} API key:`, error);
      setApiKeyTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setIsTestingApiKey(null);
    }
  };

  const updateLlmConfig = (type: 'screenplay' | 'scene' | 'chat', config: Partial<LLMConfig>) => {
    setLlmSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], ...config }
    }));
  };

  const updateApiKey = (provider: 'openai' | 'gemini', apiKey: string) => {
    setLlmSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: apiKey }
    }));
    // Clear test result when API key changes
    setApiKeyTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[provider];
      return newResults;
    });
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">General Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure basic application behavior and preferences.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Auto-save</label>
                  <p className="text-xs text-muted-foreground">Automatically save changes</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Startup Behavior</label>
                  <p className="text-xs text-muted-foreground">What happens when the app starts</p>
                </div>
                <Button variant="outline" size="sm">Show Dashboard</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Default Project</label>
                  <p className="text-xs text-muted-foreground">Default project to open</p>
                </div>
                <Button variant="outline" size="sm">Select Project</Button>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Profile Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your user profile and account information.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                    placeholder="Enter first name"
                    defaultValue={user?.username?.split(' ')[0] || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                    placeholder="Enter last name"
                    defaultValue={user?.username?.split(' ').slice(1).join(' ') || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input 
                    type="email" 
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                    placeholder="Enter email address"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-models':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Model Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure AI models for different use cases and manage API keys.
              </p>
            </div>

            {isLoadingModels ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading available models...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* API Keys Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h4 className="text-md font-semibold">API Keys</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OpenAI API Key */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">OpenAI API Key</label>
                      <div className="flex space-x-2">
                        <input
                          type="password"
                          className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                          placeholder="sk-..."
                          value={llmSettings.apiKeys.openai || ''}
                          onChange={(e) => updateApiKey('openai', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApiKeyTest('openai')}
                          disabled={!llmSettings.apiKeys.openai || isTestingApiKey === 'openai'}
                          className="flex items-center space-x-1"
                        >
                          {isTestingApiKey === 'openai' ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <TestTube className="h-3 w-3" />
                          )}
                          <span>Test</span>
                        </Button>
                      </div>
                      {apiKeyTestResults.openai !== undefined && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          apiKeyTestResults.openai ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {apiKeyTestResults.openai ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{apiKeyTestResults.openai ? 'Valid' : 'Invalid'}</span>
                        </div>
                      )}
                    </div>

                    {/* Gemini API Key */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gemini API Key</label>
                      <div className="flex space-x-2">
                        <input
                          type="password"
                          className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                          placeholder="AI..."
                          value={llmSettings.apiKeys.gemini || ''}
                          onChange={(e) => updateApiKey('gemini', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApiKeyTest('gemini')}
                          disabled={!llmSettings.apiKeys.gemini || isTestingApiKey === 'gemini'}
                          className="flex items-center space-x-1"
                        >
                          {isTestingApiKey === 'gemini' ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <TestTube className="h-3 w-3" />
                          )}
                          <span>Test</span>
                        </Button>
                      </div>
                      {apiKeyTestResults.gemini !== undefined && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          apiKeyTestResults.gemini ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {apiKeyTestResults.gemini ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{apiKeyTestResults.gemini ? 'Valid' : 'Invalid'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Model Configurations */}
                {availableModels && (
                  <div className="space-y-6">
                    {/* Screenplay Model */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="text-md font-semibold">Screenplay Operations</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Provider</label>
                          <select
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                            value={llmSettings.screenplay.provider}
                            onChange={(e) => updateLlmConfig('screenplay', { provider: e.target.value as 'openai' | 'gemini' })}
                          >
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Gemini</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model</label>
                          <select
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                            value={llmSettings.screenplay.model_name}
                            onChange={(e) => updateLlmConfig('screenplay', { model_name: e.target.value })}
                          >
                            {availableModels.providers[llmSettings.screenplay.provider]?.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Scene Model */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-5 w-5 text-primary" />
                        <h4 className="text-md font-semibold">Scene Operations</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Provider</label>
                          <select
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                            value={llmSettings.scene.provider}
                            onChange={(e) => updateLlmConfig('scene', { provider: e.target.value as 'openai' | 'gemini' })}
                          >
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Gemini</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model</label>
                          <select
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                            value={llmSettings.scene.model_name}
                            onChange={(e) => updateLlmConfig('scene', { model_name: e.target.value })}
                          >
                            {availableModels.providers[llmSettings.scene.provider]?.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Chat Model */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <h4 className="text-md font-semibold">Chat Assistant</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Provider</label>
                          <select
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                            value={llmSettings.chat.provider}
                            onChange={(e) => updateLlmConfig('chat', { provider: e.target.value as 'openai' | 'gemini' })}
                          >
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Gemini</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model</label>
                          <select
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                            value={llmSettings.chat.model_name}
                            onChange={(e) => updateLlmConfig('chat', { model_name: e.target.value })}
                          >
                            {availableModels.providers[llmSettings.chat.provider]?.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Appearance Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Customize the look and feel of the application.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <ModeToggle />
              </div>
              
              <div>
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex space-x-2 mt-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <div className="flex items-center space-x-2 mt-2">
                  <Button variant="outline" size="sm">A-</Button>
                  <span className="text-sm">Medium</span>
                  <Button variant="outline" size="sm">A+</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure how and when you receive notifications.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Push Notifications</label>
                  <p className="text-xs text-muted-foreground">Receive push notifications</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Sound Alerts</label>
                  <p className="text-xs text-muted-foreground">Play sound for notifications</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your account security and privacy settings.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Two-Factor Authentication</label>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Setup 2FA</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Session Timeout</label>
                  <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                </div>
                <Button variant="outline" size="sm">30 minutes</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <p className="text-xs text-muted-foreground">Change your password</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Data & Storage</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your data and storage preferences.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto Backup</label>
                  <p className="text-xs text-muted-foreground">Automatically backup your data</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Storage Location</label>
                  <p className="text-xs text-muted-foreground">Where your data is stored</p>
                </div>
                <Button variant="outline" size="sm">Local</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Data Retention</label>
                  <p className="text-xs text-muted-foreground">How long to keep your data</p>
                </div>
                <Button variant="outline" size="sm">1 year</Button>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Language & Region</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set your preferred language and regional settings.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Region</label>
                <select className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Time Zone</label>
                <select className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm">
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC+0 (GMT)</option>
                  <option>UTC+1 (Central European Time)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Performance Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Optimize application performance and resource usage.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Hardware Acceleration</label>
                  <p className="text-xs text-muted-foreground">Use GPU acceleration when available</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Memory Limit</label>
                  <p className="text-xs text-muted-foreground">Maximum memory usage</p>
                </div>
                <Button variant="outline" size="sm">2 GB</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto-optimize</label>
                  <p className="text-xs text-muted-foreground">Automatically optimize performance</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced configuration options for power users.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Developer Mode</label>
                  <p className="text-xs text-muted-foreground">Enable developer features</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Debug Logging</label>
                  <p className="text-xs text-muted-foreground">Enable detailed logging</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Experimental Features</label>
                  <p className="text-xs text-muted-foreground">Enable experimental features</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Information about the application and version details.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Version</span>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Build</span>
                <span className="text-sm text-muted-foreground">2024.8.17</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">License</span>
                <span className="text-sm text-muted-foreground">MIT</span>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" size="sm">Check for Updates</Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a setting category</p>
          </div>
        );
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        <SettingsIcon className="mr-2 h-4 w-4 " />
        Settings
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white dark:bg-black/50 dark:text-white flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Modal Content */}
          <div className="bg-background border dark:border-neutral-900 rounded-lg shadow-lg w-[900px] h-[700px] flex flex-col max-w-[90vw] max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border dark:text-white">
              <div>
                <h2 className="text-xl font-semibold">Settings</h2>
                <p className="text-sm text-muted-foreground">Configure your application preferences</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden text-foreground">
              {/* Left Sidebar - Navigation */}
              <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto">
                <nav className="p-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors mb-1 ${
                        activeSection === section.id
                          ? 'bg-background border border-border shadow-sm'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-muted-foreground">
                          {section.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">{section.title}</span>
                            {section.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {section.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {renderSectionContent(activeSection)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;