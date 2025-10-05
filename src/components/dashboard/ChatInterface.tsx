import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Settings, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { llmConfigService } from '@/services/api/llmConfigService';
import { LLMConfig, LLMModels } from '@/types';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Chat model selection state
  const [chatModel, setChatModel] = useState<LLMConfig>({
    provider: 'openai',
    model_name: 'gpt-4o-mini',
    temperature: 0.5,
    timeout: 30.0,
    api_key: null
  });
  const [availableModels, setAvailableModels] = useState<LLMModels | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when chat becomes visible
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isVisible]);

  // Load available models when chat becomes visible
  useEffect(() => {
    if (isVisible && !availableModels) {
      loadAvailableModels();
    }
  }, [isVisible, availableModels]);

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

  const updateChatModel = (updates: Partial<LLMConfig>) => {
    setChatModel(prev => ({ ...prev, ...updates }));
  };

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelSelector) {
        const target = event.target as Element;
        if (!target.closest('.model-selector-container')) {
          setShowModelSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelSelector]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm currently disconnected, but I'm ready for future integration! Your message has been received.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">MythusAI Assistant</h2>
            <p className="text-xs text-muted-foreground">Currently disconnected</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative model-selector-container">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 h-8 px-3"
            >
              <Settings className="h-3 w-3" />
              <span className="text-xs">
                {chatModel.provider === 'openai' ? 'OpenAI' : 'Gemini'} - {chatModel.model_name}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
            
            {/* Model Selector Dropdown */}
            {showModelSelector && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
                <div className="space-y-4">
                  {isLoadingModels ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading models...</span>
                    </div>
                  ) : availableModels ? (
                    <>
                      <div>
                        <label htmlFor="chat-provider" className="text-sm font-medium text-foreground">Provider</label>
                        <select
                          id="chat-provider"
                          className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                          value={chatModel.provider}
                          onChange={(e) => updateChatModel({ provider: e.target.value as 'openai' | 'gemini' })}
                        >
                          <option value="openai">OpenAI</option>
                          <option value="gemini">Gemini</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="chat-model" className="text-sm font-medium text-foreground">Model</label>
                        <select
                          id="chat-model"
                          className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                          value={chatModel.model_name}
                          onChange={(e) => updateChatModel({ model_name: e.target.value })}
                        >
                          {availableModels.providers[chatModel.provider]?.map((model) => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Failed to load models</p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="chat-temperature" className="text-sm font-medium text-foreground">
                      Temperature: {chatModel.temperature}
                    </label>
                    <input
                      id="chat-temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={chatModel.temperature}
                      onChange={(e) => updateChatModel({ temperature: parseFloat(e.target.value) })}
                      className="w-full mt-1"
                      disabled={llmConfigService.isTemperatureRestricted(chatModel.model_name)}
                    />
                    {llmConfigService.isTemperatureRestricted(chatModel.model_name) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Temperature is fixed at 1.0 for this model
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModelSelector(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                key="welcome-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to MythusAI</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  I'm here to help with your screenplays, characters, and production planning. 
                  Start a conversation to get assistance!
                </p>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 max-w-[70%] break-words",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing-indicator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition min-h-[48px] max-h-32 overflow-auto"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInterface;
