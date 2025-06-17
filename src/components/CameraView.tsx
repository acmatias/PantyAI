import React, { useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertCircle, Settings, HelpCircle, User, LogOut } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { User as UserType } from '@supabase/supabase-js';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
  user: UserType | null;
  onShowAuth: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  onCapture, 
  isProcessing, 
  user, 
  onShowAuth 
}) => {
  const { 
    videoRef, 
    canvasRef, 
    isStreamActive, 
    error, 
    isRetrying,
    startCamera, 
    stopCamera, 
    retryCamera,
    captureImage 
  } = useCamera();
  const [captureAnimation, setCaptureAnimation] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      setCaptureAnimation(true);
      setTimeout(() => setCaptureAnimation(false), 300);
      onCapture(imageData);
    }
  };

  const getErrorIcon = () => {
    switch (error?.type) {
      case 'permission':
        return <Settings className="w-16 h-16 mb-4 text-yellow-400" />;
      case 'busy':
        return <AlertCircle className="w-16 h-16 mb-4 text-orange-400" />;
      case 'not-found':
        return <Camera className="w-16 h-16 mb-4 text-red-400" />;
      default:
        return <AlertCircle className="w-16 h-16 mb-4 text-red-400" />;
    }
  };

  const getTroubleshootingSteps = () => {
    const commonSteps = [
      'Refresh the page and try again',
      'Try using a different browser (Chrome, Firefox, Safari)',
      'Restart your browser completely',
      'Check if other apps are using the camera and close them'
    ];

    const specificSteps = {
      permission: [
        'Click the camera icon in your browser\'s address bar',
        'Select "Always allow" for camera access',
        'Refresh the page after changing permissions'
      ],
      busy: [
        'Close other video call apps (Zoom, Teams, etc.)',
        'Close other browser tabs using the camera',
        'Close other camera apps on your device',
        'Wait a moment and try again'
      ],
      'not-found': [
        'Check if your camera is properly connected',
        'Try a different USB port (for external cameras)',
        'Check device settings to ensure camera is enabled',
        'Update your camera drivers'
      ],
      hardware: [
        'Try with a different camera if available',
        'Check camera privacy settings in your OS',
        'Update your browser to the latest version'
      ]
    };

    return error ? [...(specificSteps[error.type] || []), ...commonSteps] : commonSteps;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h1 className="text-xl font-semibold">Capture Pantry Items</h1>
        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={retryCamera}
              disabled={isRetrying}
              className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          {user ? (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.email}</span>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-colors"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6">
            {getErrorIcon()}
            <h2 className="text-xl font-semibold mb-2">{error.message}</h2>
            <p className="text-sm text-gray-300 text-center mb-6 max-w-md">
              {error.suggestion}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={retryCamera}
                disabled={isRetrying}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
              
              <button
                onClick={() => setShowHelp(true)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                Get Help
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-300 ${
                captureAnimation ? 'scale-105' : 'scale-100'
              }`}
            />
            
            {/* Capture Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-6 border-2 border-white/30 rounded-2xl" />
              <div className="absolute top-8 left-8 w-4 h-4 border-l-2 border-t-2 border-white" />
              <div className="absolute top-8 right-8 w-4 h-4 border-r-2 border-t-2 border-white" />
              <div className="absolute bottom-8 left-8 w-4 h-4 border-l-2 border-b-2 border-white" />
              <div className="absolute bottom-8 right-8 w-4 h-4 border-r-2 border-b-2 border-white" />
            </div>

            {/* Flash Effect */}
            {captureAnimation && (
              <div className="absolute inset-0 bg-white opacity-80 animate-pulse" />
            )}

            {/* Camera Status */}
            {isRetrying && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                Starting camera...
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      {!error && (
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-white/80 mb-2">
            Position pantry items within the frame and tap capture
          </p>
          {!user && (
            <p className="text-xs text-yellow-400">
              Sign in to save your captured items to your pantry
            </p>
          )}
        </div>
      )}

      {/* Capture Button */}
      <div className="flex justify-center pb-8">
        <button
          onClick={handleCapture}
          disabled={!isStreamActive || isProcessing || error !== null}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 ${
            isStreamActive && !isProcessing && !error
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Camera Troubleshooting</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Try these steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    {getTroubleshootingSteps().map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Still having issues?</h4>
                  <p className="text-sm text-gray-600">
                    This app requires camera access to capture photos of your pantry items. 
                    Make sure your device has a working camera and your browser supports camera access.
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};