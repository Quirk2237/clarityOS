import { useState, useCallback, useRef } from 'react';
import { z } from 'zod';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UseAIChatOptions {
  endpoint: string;
  schema: z.ZodSchema;
  headers: Record<string, string>;
  body: Record<string, any>;
  onError?: (error: Error) => void;
}

export function useAIChat<T>({ endpoint, schema, headers, body, onError }: UseAIChatOptions) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  // ✅ Track chat history to send to Edge Function
  const messagesRef = useRef<Message[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // ✅ Add user message to history
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message.trim()
      };
      messagesRef.current = [...messagesRef.current, userMessage];

      // ✅ Send full message history to Edge Function (same format as before)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...body,
          messages: messagesRef.current.map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      
      // ✅ Validate with Zod schema
      const validatedData = schema.parse(rawData);
      setData(validatedData as T);
      
      // ✅ Add AI response to history for next request
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: (validatedData as any).question || 'AI response'
      };
      messagesRef.current = [...messagesRef.current, aiMessage];
      
      setInput(''); // Clear input on success
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, headers, body, isLoading, onError, schema]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  return {
    input,
    setInput,
    isLoading,
    error,
    data,
    sendMessage,
    handleSubmit,
    clearError: () => setError(null),
    clearData: () => setData(null),
  };
} 