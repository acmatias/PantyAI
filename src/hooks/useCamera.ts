import { useRef, useCallback, useState } from 'react';

interface CameraError {
  type: 'permission' | 'hardware' | 'busy' | 'not-found' | 'unknown';
  message: string;
  suggestion: string;
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const parseError = (err: any): CameraError => {
    console.error('Camera error details:', err);

    if (err.name === 'NotAllowedError') {
      return {
        type: 'permission',
        message: 'Camera access denied',
        suggestion: 'Please allow camera access in your browser settings and refresh the page'
      };
    }

    if (err.name === 'NotReadableError') {
      // Check for specific "Could not start video source" message
      if (err.message && err.message.includes('Could not start video source')) {
        return {
          type: 'hardware',
          message: 'Camera hardware initialization failed',
          suggestion: 'Your camera hardware may not be responding. Please try refreshing the page, restart your browser, or check if the camera is being used by another application'
        };
      }
      
      return {
        type: 'busy',
        message: 'Camera is busy or unavailable',
        suggestion: 'Please close other apps using the camera (like video calls, other camera apps) and try again'
      };
    }

    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return {
        type: 'not-found',
        message: 'No camera found',
        suggestion: 'Please ensure a camera is connected to your device'
      };
    }

    if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
      return {
        type: 'hardware',
        message: 'Camera constraints not supported',
        suggestion: 'Your camera may not support the required settings. Trying with basic settings...'
      };
    }

    return {
      type: 'unknown',
      message: 'Camera access failed',
      suggestion: 'Please refresh the page and try again. If the problem persists, try using a different browser'
    };
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreamActive(false);
    }
  }, []);

  const tryWithConstraints = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.warn('Failed with constraints:', constraints, err);
      throw err;
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsRetrying(true);

      // Stop any existing stream first
      stopCamera();

      // Try different constraint combinations, starting with ideal settings
      const constraintOptions: MediaStreamConstraints[] = [
        // Ideal settings - rear camera with high resolution
        {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Fallback 1 - rear camera with lower resolution
        {
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Fallback 2 - any camera with specific resolution
        {
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Fallback 3 - basic camera access
        {
          video: true
        },
        // Fallback 4 - front camera if rear is not available 
        {
          video: { facingMode: 'user' }
        }
      ];

      let stream: MediaStream | null = null;
      let lastError: any = null;

      // Try each constraint option
      for (const constraints of constraintOptions) {
        try {
          stream = await tryWithConstraints(constraints);
          console.log('Camera started with constraints:', constraints);
          break;
        } catch (err) {
          lastError = err;
          // If it's a permission error, don't try other constraints
          if (err.name === 'NotAllowedError') {
            throw err;
          }
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('All camera initialization attempts failed');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      const parsedError = parseError(err);
      setError(parsedError);
      setIsStreamActive(false);
    } finally {
      setIsRetrying(false);
    }
  }, [stopCamera]);

  const retryCamera = useCallback(async () => {
    // Add small delay before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    await startCamera();
  }, [startCamera]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  return {
    videoRef,
    canvasRef,
    isStreamActive,
    error,
    isRetrying,
    startCamera,
    stopCamera,
    retryCamera,
    captureImage
  };
};