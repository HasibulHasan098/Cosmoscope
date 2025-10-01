import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { getAutocompleteSuggestions } from '../services/geminiService';
import { useSettingsStore } from '../state/settingsStore';

// Simple component to render markdown's **bold** syntax as <strong> tags.
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  // Split the text by the bold delimiter, keeping the bolded parts
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // If it's a bold part, render it as <strong>
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        // Otherwise, render as plain text
        return part;
      })}
    </>
  );
};

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  title: string;
  placeholder: string;
  children?: React.ReactNode;
  onClose?: () => void;
  defaultSuggestions?: string[];
  onImageUpload?: (file: File) => void;
  chatContext?: 'earth' | 'mars';
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading, title, placeholder, children, onClose, defaultSuggestions, onImageUpload, chatContext }) => {
  const [input, setInput] = useState('');
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(defaultSuggestions || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const prevIsLoadingRef = useRef<boolean>(isLoading);

  const { getSnapshot } = useSettingsStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Effect to fetch contextual suggestions after the AI has responded.
  useEffect(() => {
    // When loading has just finished, and there's no text in the input
    if (prevIsLoadingRef.current && !isLoading && input.length === 0) {
        const fetchContextualSuggestions = async () => {
            if (!chatContext) {
                // Fallback to default if no context is available
                setActiveSuggestions(defaultSuggestions || []);
                return;
            };
            try {
                const language = getSnapshot().language;
                // Pass empty string to get suggestions based on history
                const suggestions = await getAutocompleteSuggestions('', messages, chatContext, language);
                // If AI returns no suggestions, show the default ones.
                setActiveSuggestions(suggestions.length > 0 ? suggestions : defaultSuggestions || []);
            } catch (error) {
                console.error("Failed to fetch contextual suggestions", error);
                setActiveSuggestions(defaultSuggestions || []);
            }
        };
        fetchContextualSuggestions();
    }
    // Update the ref for the next render.
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, input, messages, chatContext, getSnapshot, defaultSuggestions]);


  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      // After sending, clear suggestions until AI response gives new ones.
      setActiveSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
    setInput('');
    // After sending, clear suggestions until AI response gives new ones.
    setActiveSuggestions([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }
    
    // When user manually clears input, reset to default suggestions
    if (value.length === 0) {
        setActiveSuggestions(defaultSuggestions || []);
        return;
    }

    // Don't fetch for very short inputs to avoid spamming API
    if (value.length < 3 || !chatContext) {
        setActiveSuggestions([]);
        return;
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
        try {
            const language = getSnapshot().language;
            const suggestions = await getAutocompleteSuggestions(value, messages, chatContext, language);
            setActiveSuggestions(suggestions);
        } catch (error) {
            console.error("Failed to fetch autocomplete suggestions", error);
            setActiveSuggestions([]);
        }
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow-2xl dark:shadow-black/30 flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="w-8">{/* Spacer */}</div>
        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white">{title}</h2>
        {onClose ? (
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-8">
            <i className="ri-close-line text-2xl"></i>
          </button>
        ) : (
          <div className="w-8">{/* Spacer */}</div>
        )}
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <i className="ri-robot-2-line text-2xl text-gray-700 dark:text-blue-400 mt-1"></i>}
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-gray-800 text-white dark:bg-blue-600' : 'bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200'}`}>
              <div className="whitespace-pre-wrap">
                {msg.parts.map((part, partIndex) => {
                  if (part.text) {
                    return <MarkdownRenderer key={partIndex} text={part.text} />;
                  }
                  if (part.inlineData) {
                    return (
                        <img 
                            key={partIndex}
                            src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                            alt="User upload"
                            className="mt-2 rounded-lg max-w-xs max-h-64 object-contain"
                        />
                    );
                  }
                  return null;
                })}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-500">
                  <h4 className="text-sm font-semibold mb-1">Sources:</h4>
                  <ul className="text-xs space-y-1">
                    {msg.sources.filter(source => source.web.uri).map((source, i) => (
                      <li key={i}>
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 hover:underline">
                          {i+1}. {source.web.title || source.web.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
             {msg.role === 'user' && <i className="ri-user-line text-2xl bg-gray-300 dark:bg-gray-600 p-1 rounded-full mt-1"></i>}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <i className="ri-robot-2-line text-2xl text-gray-700 dark:text-blue-400 mt-1"></i>
            <div className="max-w-xl p-3 rounded-lg bg-gray-100 dark:bg-[#374151] flex items-center space-x-2 text-gray-800 dark:text-gray-200">
              <LoadingSpinner />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {activeSuggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-3">
            {activeSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-gray-200 dark:bg-[#374151] text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blue-600 text-sm rounded-full py-1.5 px-4 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          {children}
           {onImageUpload && (
            <>
              <button
                onClick={handleUploadClick}
                disabled={isLoading}
                className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full p-2 text-gray-800 dark:text-white transition-colors flex items-center justify-center w-10 h-10"
                aria-label="Upload an image"
              >
                <i className="ri-image-add-line"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </>
          )}
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-grow bg-gray-100 dark:bg-[#374151] rounded-full py-2 px-4 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-blue-500 transition"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gray-800 hover:bg-gray-900 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full p-2 text-white transition-colors flex items-center justify-center w-10 h-10"
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;