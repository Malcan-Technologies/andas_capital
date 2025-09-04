import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useCardDetection } from '@/hooks/useCardDetection';
import { DetectionResult } from '@/lib/opencv-utils';

interface SmartCardCaptureProps {
  onCapture: (imageData: string) => void;
  onRetake: () => void;
  isSubmitting?: boolean;
  preview?: string | null;
  className?: string;
  captureButtonText?: string;
  retakeButtonText?: string;
  continueButtonText?: string;
  instructions?: string[];
  stepText?: string;
}

export const SmartCardCapture: React.FC<SmartCardCaptureProps> = ({
  onCapture,
  onRetake,
  isSubmitting = false,
  preview = null,
  className = "",
  captureButtonText = "Capture",
  retakeButtonText = "Retake", 
  continueButtonText = "Continue",
  instructions = [],
  stepText = ""
}) => {
  const webcamRef = useRef<Webcam | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [autoCapture, setAutoCapture] = useState(true); // Enable auto-capture by default
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isInitialized,
    isDetecting,
    lastResult,
    startDetection,
    stopDetection,
    captureCard,
    error: detectionError
  } = useCardDetection({
    enabled: !preview, // Only detect when not in preview mode
    onCardDetected: (result: DetectionResult) => {
      if (autoCapture && !preview) {
        // Start auto-capture countdown
        startAutoCapture();
      }
    },
    onCardLost: () => {
      // Cancel auto-capture if card is lost
      cancelAutoCapture();
    },
    blurThreshold: 50, // Improved threshold for better quality
    confidenceThreshold: 40, // Improved threshold for better detection
    stabilityThreshold: 3 // Need 3 consecutive good detections for faster response
  });

  const startAutoCapture = useCallback(() => {
    if (countdownRef.current) return; // Already counting down

    let count = 3;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);

      if (count <= 0) {
        // Auto capture
        const croppedImage = captureCard();
        if (croppedImage) {
          onCapture(croppedImage);
        } else {
          // Fallback to manual capture
          manualCapture();
        }
        cancelAutoCapture();
      }
    }, 1000);
  }, [captureCard, onCapture]);

  const cancelAutoCapture = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }, []);

  const manualCapture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      onCapture(image);
    }
  }, [onCapture]);

  const handleCapture = useCallback(() => {
    cancelAutoCapture();
    
    // Try to use the cropped card first
    const croppedImage = captureCard();
    if (croppedImage) {
      onCapture(croppedImage);
    } else {
      // Fallback to manual capture
      manualCapture();
    }
  }, [captureCard, onCapture, manualCapture, cancelAutoCapture]);

  // Start detection when webcam is ready
  useEffect(() => {
    if (!preview && isInitialized && webcamRef.current && overlayCanvasRef.current) {
      const video = webcamRef.current.video;
      if (video && overlayCanvasRef.current) {
        startDetection(video, overlayCanvasRef.current);
      }
    }

    return () => {
      stopDetection();
      cancelAutoCapture();
    };
  }, [preview, isInitialized]); // Remove function dependencies that cause re-renders

  // Handle canvas overlay resize
  useEffect(() => {
    if (overlayCanvasRef.current && webcamRef.current?.video) {
      const video = webcamRef.current.video;
      const canvas = overlayCanvasRef.current;
      
      const resizeCanvas = () => {
        const rect = video.getBoundingClientRect();
        // Set canvas size to match the displayed video size
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      };

      // Initial resize
      resizeCanvas();
      
      // Listen for video resize events
      const resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(video);
      
      // Also listen for window resize
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [preview]);

  if (preview) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
          <div className="relative aspect-[16/9]">
            <img src={preview} alt="captured card" className="absolute inset-0 w-full h-full object-contain" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={onRetake}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {retakeButtonText}
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => onCapture(preview)}
            className="px-6 py-2 rounded-xl bg-purple-primary text-white disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            {isSubmitting ? 'Saving...' : continueButtonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error display */}
      {detectionError && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <strong>Detection Error:</strong> {detectionError}
          <div className="text-xs mt-1">
            Try refreshing the page or ensure your camera permissions are granted.
          </div>
        </div>
      )}

      {/* Instructions */}
      {instructions.length > 0 && (
        <div className="rounded-xl border border-blue-tertiary/20 bg-blue-tertiary/5 px-4 py-3 text-sm text-gray-700">
          <ul className="list-disc pl-5 space-y-1">
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detection status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600">
            {!isInitialized ? 'Initializing OpenCV...' : 
             !isDetecting ? 'Ready - Position card in frame' : 
             'Detecting card...'}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {lastResult?.confidence !== undefined && (
            <span className={lastResult.confidence > 40 ? 'text-green-600' : 'text-yellow-600'}>
              Confidence: {lastResult.confidence.toFixed(0)}%
            </span>
          )}
          {lastResult?.blurScore !== undefined && (
            <span className={lastResult.blurScore > 50 ? 'text-green-600' : 'text-yellow-600'}>
              Sharpness: {lastResult.blurScore.toFixed(0)}
            </span>
          )}
          {lastResult?.corners && (
            <span>Corners: {lastResult.corners.length}</span>
          )}
          {lastResult?.aspectRatio !== undefined && (
            <span className={lastResult.aspectRatio > 1.0 && lastResult.aspectRatio < 3.0 ? 'text-green-600' : 'text-red-600'}>
              Ratio: {lastResult.aspectRatio.toFixed(2)}
            </span>
          )}
          {lastResult?.detectionMethod && (
            <span className="text-xs text-purple-600">
              {lastResult.detectionMethod.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Auto-capture toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Auto-capture when card detected</span>
        <button
          onClick={() => setAutoCapture(!autoCapture)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoCapture ? 'bg-purple-primary' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoCapture ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Camera view with overlay */}
      <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-primary/5 to-blue-tertiary/5 border border-gray-100 relative">
        <div className="relative aspect-[16/9] bg-black/5 rounded-xl overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.98} // Higher quality for better text sharpness
            videoConstraints={{ 
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 }, // Higher resolution for better quality
              height: { ideal: 1080 }
            }}
            className="w-full h-full object-cover"
          />
          
                {/* Detection overlay canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ mixBlendMode: 'normal' }}
      />

          {/* Countdown overlay */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-primary">{countdown}</span>
              </div>
            </div>
          )}

          {/* Detection status overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-center">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                lastResult?.isValidCard ? 
                'bg-green-500 text-white' : 
                'bg-yellow-500 text-white'
              }`}>
                {lastResult?.isValidCard ? 'Card Ready ✓' : 'Position Card'}
              </div>
              
              {autoCapture && (
                <div className="px-3 py-1 rounded-full bg-purple-primary text-white text-xs font-medium">
                  Auto-capture {countdown ? 'ON' : 'Ready'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Capture button */}
      <div className="flex justify-end">
        <button 
          onClick={handleCapture}
          disabled={!isInitialized}
          className="px-6 py-2 rounded-xl bg-purple-primary text-white disabled:opacity-50 hover:bg-purple-700 transition-colors"
        >
          {captureButtonText}
        </button>
      </div>
    </div>
  );
};
