# OpenCV.js Card Detection Integration

## Overview
This document describes the OpenCV.js integration for real-time ID card detection in the KYC process.

## Fixed Issues (Latest Update)

### 1. ✅ Infinite Re-render Loop
- **Problem**: `SmartCardCapture` component was causing maximum update depth exceeded error
- **Fix**: Removed unstable function dependencies from useEffect hooks
- **Technical**: Used refs to access current values instead of dependencies

### 2. ✅ Performance Issues
- **Problem**: Console logging in detection loop causing performance issues
- **Fix**: Removed excessive debug console.log statements
- **Technical**: Detection runs every 200ms without blocking

### 3. ✅ Canvas Overlay Issues
- **Problem**: Canvas overlay not positioned correctly
- **Fix**: Added proper z-index and ResizeObserver for dynamic sizing
- **Technical**: Canvas now properly overlays video with transparent background

## Features

### Real-time Card Detection
- **Edge Detection**: Uses Canny edge detection with optimized thresholds (30, 100)
- **Contour Analysis**: Finds rectangular shapes with 4 corners
- **Blur Detection**: Laplacian variance to reject blurry images
- **Confidence Scoring**: Based on area ratio and aspect ratio

### Visual Feedback
- **Guide Rectangle**: White dashed frame showing where to position card
- **Corner Markers**: L-shaped markers on guide corners when no card detected
- **Detection Bounds**: 
  - 🟡 Yellow: Card detected but positioning needs improvement
  - 🟢 Green: Valid card ready for capture
- **Real-time Stats**: Shows confidence, sharpness, and corner count

### User Experience
- **Auto-capture**: Optional 3-second countdown when card is stable
- **Manual Capture**: Always available fallback
- **Error Handling**: Clear error messages and troubleshooting tips
- **Status Indicators**: Visual feedback for OpenCV initialization and detection state

## Technical Implementation

### Core Files
1. **`lib/opencv-utils.ts`**: OpenCV singleton manager and detection algorithms
2. **`hooks/useCardDetection.ts`**: React hook for detection lifecycle
3. **`components/SmartCardCapture.tsx`**: UI component with camera and overlay

### Detection Parameters
```typescript
{
  blurThreshold: 50,           // Minimum sharpness score
  confidenceThreshold: 30,     // Minimum detection confidence
  stabilityThreshold: 3,       // Consecutive detections needed
  detectionInterval: 200       // ms between detection runs
}
```

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebRTC**: Required for camera access
- **WebAssembly**: Required for OpenCV.js
- **Canvas API**: Required for overlay rendering

## Troubleshooting

### No Overlay Visible
1. Check browser console for errors
2. Verify camera permissions granted
3. Ensure OpenCV.js loads (check Network tab)
4. Look for "Initializing OpenCV..." status

### Card Not Detected
1. Ensure good lighting (avoid shadows/glare)
2. Position card flat within guide rectangle
3. Check sharpness score (should be > 50)
4. Verify confidence score appears in status

### Performance Issues
1. Close other camera applications
2. Use Chrome for better performance
3. Ensure stable internet for OpenCV.js download
4. Check CPU usage in browser task manager

## Testing Checklist

### Basic Functionality
- [ ] Guide rectangle appears on camera feed
- [ ] Status shows "Ready - Position card in frame"
- [ ] Corner markers visible when no card detected
- [ ] Detection stats appear when card positioned

### Card Detection
- [ ] Yellow bounds appear when card detected
- [ ] Green bounds when card properly positioned
- [ ] Confidence score increases with better positioning
- [ ] Sharpness score responds to focus changes

### Auto-capture
- [ ] Toggle enables/disables auto-capture
- [ ] 3-second countdown appears when card ready
- [ ] Manual capture always works as fallback
- [ ] Captured image is properly cropped

### Error Handling
- [ ] Clear error messages for OpenCV load failures
- [ ] Camera permission error handling
- [ ] Graceful fallback to manual capture

## Performance Notes

- OpenCV.js loads ~8MB library on first use
- Detection runs every 200ms (5 FPS)
- Canvas overlay updates in real-time
- Memory cleanup prevents leaks

## Future Enhancements

1. **Improved Detection**: Fine-tune for Malaysian MyKad specific dimensions
2. **Multi-format Support**: Support other ID card types
3. **Enhanced Feedback**: Audio cues for accessibility
4. **Offline Mode**: Cache OpenCV.js for offline use
5. **Advanced Filters**: Additional image enhancement options