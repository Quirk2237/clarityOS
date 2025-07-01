import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Button } from '@/components/ui/button';

interface AIErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface AIErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class AIErrorBoundary extends React.Component<AIErrorBoundaryProps, AIErrorBoundaryState> {
  constructor(props: AIErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AIErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: error.stack || 'No stack trace available'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Error Boundary caught an error:', error, errorInfo);
    
    // Log specific AI SDK errors differently
    if (error.message.includes('Network request failed')) {
      console.error('🌐 Network Error: Check internet connection and API configuration');
    } else if (error.message.includes('API key')) {
      console.error('🔑 API Key Error: Check OpenAI API key configuration');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <View className="flex-1 justify-center items-center p-6 bg-background">
          <View className="bg-card rounded-3xl p-6 border border-border max-w-md">
            <Text className="text-2xl mb-4 text-center">⚠️</Text>
            <Text className="text-lg font-bold text-center mb-4 text-foreground">
              Something went wrong
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6">
              {error?.message.includes('Network request failed') 
                ? 'Unable to connect to the AI service. Please check your internet connection and try again.'
                : error?.message.includes('API key')
                ? 'Service temporarily unavailable. Please try again later.'
                : 'An unexpected error occurred. Please try again.'}
            </Text>
            <Button 
              onPress={this.handleRetry}
              className="w-full"
              style={{ backgroundColor: '#9AFF9A' }}
            >
              <Text className="font-semibold text-black">Try Again</Text>
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
} 