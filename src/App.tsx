import React, { useState, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { ProcessingView } from './components/ProcessingView';
import { ConfirmationView } from './components/ConfirmationView';
import { AuthModal } from './components/AuthModal';
import { useVisionAI } from './hooks/useVisionAI';
import { useAuth } from './hooks/useAuth';
import { usePantryItems } from './hooks/usePantryItems';
import { CaptureState, PantryItem } from './types';
import { User, LogOut, Package } from 'lucide-react';

const FREE_TRIAL_KEY = 'pantry_capture_free_trial_used';

function App() {
  const [captureState, setCaptureState] = useState<CaptureState>({
    step: 'camera',
    detectedItems: [],
    isLoading: false
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem(FREE_TRIAL_KEY) === 'true';
  });

  const { analyzeImage, isAnalyzing, error } = useVisionAI();
  const { user, loading: authLoading, signOut } = useAuth();
  const { savePantryItems, isSaving, error: saveError } = usePantryItems();

  // Clear free trial status when user signs in
  useEffect(() => {
    if (user) {
      localStorage.removeItem(FREE_TRIAL_KEY);
      setHasUsedFreeTrial(false);
    }
  }, [user]);

  const handleCapture = async (imageData: string) => {
    // Check if unauthenticated user has already used their free trial
    if (!user && hasUsedFreeTrial) {
      setShowAuthModal(true);
      return;
    }

    // If unauthenticated user hasn't used free trial yet, mark it as used
    if (!user && !hasUsedFreeTrial) {
      localStorage.setItem(FREE_TRIAL_KEY, 'true');
      setHasUsedFreeTrial(true);
    }

    setCaptureState(prev => ({
      ...prev,
      step: 'processing',
      capturedImage: imageData,
      isLoading: true
    }));

    try {
      const detectedItems = await analyzeImage(imageData);
      setCaptureState(prev => ({
        ...prev,
        step: 'confirmation',
        detectedItems,
        isLoading: false
      }));
    } catch (err) {
      setCaptureState(prev => ({
        ...prev,
        step: 'camera',
        isLoading: false,
        error: 'Failed to analyze image. Please try again.'
      }));
    }
  };

  const handleSave = async (items: PantryItem[]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const success = await savePantryItems(items);
    
    if (success) {
      alert(`Successfully saved ${items.length} items to your pantry!`);
      // Reset to camera view
      setCaptureState({
        step: 'camera',
        detectedItems: [],
        isLoading: false
      });
    } else {
      alert(`Failed to save items: ${saveError || 'Unknown error'}`);
    }
  };

  const handleRetake = () => {
    setCaptureState({
      step: 'camera',
      detectedItems: [],
      isLoading: false
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-center">
          <Package className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 text-white bg-gray-900">
      <h1 className="text-xl font-semibold">Pantry Capture</h1>
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>
    </div>
  );

  if (captureState.step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-900">
        {renderHeader()}
        <ProcessingView />
      </div>
    );
  }

  if (captureState.step === 'confirmation' && captureState.capturedImage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}
        <ConfirmationView
          capturedImage={captureState.capturedImage}
          detectedItems={captureState.detectedItems}
          onSave={handleSave}
          onRetake={handleRetake}
          isSaving={isSaving}
          user={user}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <CameraView
        onCapture={handleCapture}
        isProcessing={captureState.isLoading || isAnalyzing}
        user={user}
        onShowAuth={() => setShowAuthModal(true)}
        hasUsedFreeTrial={hasUsedFreeTrial}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;