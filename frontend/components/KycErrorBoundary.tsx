"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class KycErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KYC Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's a React Context error
    if (error.message.includes('useContext') || error.message.includes('context')) {
      console.warn('React Context error detected, attempting recovery...');
      
      // Try to recover after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 1000);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Show fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-offwhite w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-lg">
            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold text-gray-700 mb-2">Loading Error</h1>
                <p className="text-sm text-gray-600 mb-4">
                  There was an issue loading the page. This is usually temporary.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 bg-purple-primary text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default KycErrorBoundary;
