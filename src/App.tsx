import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { ProcessingView } from './components/ProcessingView';
import { ConfirmationView } from './components/ConfirmationView';
import { useVisionAI } from './hooks/useVisionAI';
import { CaptureState, PantryItem } from './types';

function App() {
  const [captureState, setCaptureState] = useState<CaptureState>({
    step: 'camera',
    detectedItems: [],
    isLoading: false
  });

  const { analyzeImage, isAnalyzing, error } = useVisionAI();

  const handleCapture = async (imageData: string) => {
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

  const handleSave = (items: PantryItem[]) => {
    // TODO: Save to Supabase
    console.log('Saving items:', items);
    alert(`Successfully identified ${items.length} items! (Supabase integration coming next)`);
    
    // Reset to camera view
    setCaptureState({
      step: 'camera',
      detectedItems: [],
      isLoading: false
    });
  };

  const handleRetake = () => {
    setCaptureState({
      step: 'camera',
      detectedItems: [],
      isLoading: false
    });
  };

  if (captureState.step === 'processing') {
    return <ProcessingView />;
  }

  if (captureState.step === 'confirmation' && captureState.capturedImage) {
    return (
      <ConfirmationView
        capturedImage={captureState.capturedImage}
        detectedItems={captureState.detectedItems}
        onSave={handleSave}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <CameraView
      onCapture={handleCapture}
      isProcessing={captureState.isLoading || isAnalyzing}
    />
  );
}

export default App;