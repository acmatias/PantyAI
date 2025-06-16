import { useState } from 'react';
import { PantryItem } from '../types';

export const useVisionAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageData: string): Promise<PantryItem[]> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert data URL to base64
      const base64Image = imageData.split(',')[1];
      
      // Call Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.items || result.items.length === 0) {
        // Return a helpful message if no food items were detected
        return [{
          id: 'no-items-detected',
          name: 'No food items detected',
          confidence: 0,
          category: 'Info',
          quantity: 0
        }];
      }

      return result.items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      console.error('Vision AI error:', err);
      
      // Return mock data as fallback for development
      if (import.meta.env.DEV) {
        console.warn('Using mock data for development');
        return [
          {
            id: '1',
            name: 'Bananas',
            confidence: 0.95,
            category: 'Fruit',
            quantity: 6
          },
          {
            id: '2',
            name: 'Bread',
            confidence: 0.87,
            category: 'Bakery',
            quantity: 1
          },
          {
            id: '3',
            name: 'Milk',
            confidence: 0.92,
            category: 'Dairy',
            quantity: 1
          }
        ];
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeImage,
    isAnalyzing,
    error
  };
};