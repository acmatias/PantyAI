export interface PantryItem {
  id: string;
  name: string;
  confidence: number;
  category?: string;
  quantity?: number;
  expiryDate?: string;
}

export interface CaptureState {
  step: 'camera' | 'processing' | 'confirmation';
  capturedImage?: string;
  detectedItems: PantryItem[];
  isLoading: boolean;
  error?: string;
}