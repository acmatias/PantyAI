import React from 'react';
import { Brain, Loader2 } from 'lucide-react';

export const ProcessingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
      <div className="text-center max-w-md">
        {/* AI Icon with Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-200 rounded-full animate-ping mx-auto" />
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Analyzing Your Items
        </h2>
        
        <p className="text-gray-600 mb-8">
          Our AI is identifying pantry items in your photo...
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-emerald-600 font-medium">Processing</span>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};