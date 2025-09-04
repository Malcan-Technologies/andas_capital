import { useCallback, useEffect, useRef, useState } from 'react';
import { openCVManager, DetectionResult } from '@/lib/opencv-utils';

interface UseCardDetectionOptions {
  enabled?: boolean;
  onCardDetected?: (result: DetectionResult) => void;
  onCardLost?: () => void;
  detectionInterval?: number; // ms between detections
  stabilityThreshold?: number; // consecutive detections needed for stable detection
  blurThreshold?: number; // minimum blur score
  confidenceThreshold?: number; // minimum confidence score
}

interface UseCardDetectionReturn {
  isInitialized: boolean;
  isDetecting: boolean;
  lastResult: DetectionResult | null;
  startDetection: (videoElement: HTMLVideoElement, overlayCanvas: HTMLCanvasElement) => void;
  stopDetection: () => void;
  captureCard: () => string | null;
  error: string | null;
}

export function useCardDetection(options: UseCardDetectionOptions = {}): UseCardDetectionReturn {
  const {
    enabled = true,
    onCardDetected,
    onCardLost,
    detectionInterval = 200,
    stabilityThreshold = 3,
    blurThreshold = 100,
    confidenceThreshold = 50
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stableDetectionCount = useRef(0);
  const lastStableResult = useRef<DetectionResult | null>(null);
  const optionsRef = useRef(options);

  // Update options ref
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize OpenCV
  useEffect(() => {
    if (!enabled) return;

    openCVManager.initialize()
      .then(() => {
        setIsInitialized(true);
        setError(null);
      })
      .catch((err) => {
        setError(`Failed to initialize OpenCV: ${err.message}`);
        setIsInitialized(false);
      });
  }, [enabled]);

  const detectCard = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isInitialized) return;

    try {
      const video = videoRef.current;
      
      // Ensure video is ready and has valid dimensions
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      // Create a temporary canvas to capture current video frame
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      tempCtx.drawImage(video, 0, 0);

      // Detect card in the current frame using hybrid method
      const result = openCVManager.detectCard(tempCanvas);
      setLastResult(result);

      // Draw detection overlay
      openCVManager.drawDetectionOverlay(canvasRef.current, video, result);

      // Check if this is a stable detection using current options
      const currentOptions = optionsRef.current;
      const isValidDetection = result.isValidCard && 
                              (result.blurScore || 0) >= (currentOptions.blurThreshold || 100) &&
                              (result.confidence || 0) >= (currentOptions.confidenceThreshold || 50);

      if (isValidDetection) {
        stableDetectionCount.current++;
        
        // If we have enough consecutive stable detections
        if (stableDetectionCount.current >= (currentOptions.stabilityThreshold || 3)) {
          if (!lastStableResult.current?.isValidCard) {
            // First time detecting a stable card
            currentOptions.onCardDetected?.(result);
            lastStableResult.current = result;
          }
        }
      } else {
        // Reset stable detection count
        if (stableDetectionCount.current > 0) {
          stableDetectionCount.current = 0;
          
          // If we previously had a stable detection, trigger card lost
          if (lastStableResult.current?.isValidCard) {
            currentOptions.onCardLost?.();
            lastStableResult.current = null;
          }
        }
      }

    } catch (err) {
      console.error('Card detection error:', err);
      setError(`Detection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [isInitialized]); // Simplify dependencies

  const startDetection = useCallback((videoElement: HTMLVideoElement, overlayCanvas: HTMLCanvasElement) => {
    if (!isInitialized || isDetecting) return;

    videoRef.current = videoElement;
    canvasRef.current = overlayCanvas;

    // Wait for video to be ready
    const startDetectionLoop = () => {
      if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
        setIsDetecting(true);
        intervalRef.current = setInterval(detectCard, optionsRef.current.detectionInterval || 200);
      } else {
        // Wait a bit more for video to be ready
        setTimeout(startDetectionLoop, 100);
      }
    };

    startDetectionLoop();
  }, [isInitialized, isDetecting]); // Stable dependencies only

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stableDetectionCount.current = 0;
    lastStableResult.current = null;
    videoRef.current = null;
    canvasRef.current = null;
  }, []);

  const captureCard = useCallback((): string | null => {
    if (!lastResult?.isValidCard || !lastResult.croppedImage) {
      return null;
    }
    return lastResult.croppedImage;
  }, [lastResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isInitialized,
    isDetecting,
    lastResult,
    startDetection,
    stopDetection,
    captureCard,
    error
  };
}
