declare global {
  interface Window {
    cv: any;
  }
}

export interface DetectionResult {
  isValidCard: boolean;
  corners?: Array<{ x: number; y: number }>;
  croppedImage?: string;
  blurScore?: number;
  confidence?: number;
  aspectRatio?: number;
  area?: number;
  detectionMethod?: string;
}

export class OpenCVManager {
  private static instance: OpenCVManager;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): OpenCVManager {
    if (!OpenCVManager.instance) {
      OpenCVManager.instance = new OpenCVManager();
    }
    return OpenCVManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('OpenCV can only be loaded in browser environment'));
        return;
      }

      // Check if OpenCV is already loaded
      if (window.cv && window.cv.Mat) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
      script.async = true;
      
      script.onload = () => {
        // OpenCV.js loads asynchronously, we need to wait for it to be ready
        const checkOpenCV = () => {
          if (window.cv && window.cv.Mat) {
            this.isLoaded = true;
            resolve();
          } else {
            setTimeout(checkOpenCV, 100);
          }
        };
        checkOpenCV();
      };

      script.onerror = () => {
        reject(new Error('Failed to load OpenCV.js'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Detects Malaysian ID card using color analysis and feature detection
   */
  detectMalaysianIDCard(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): DetectionResult {
    if (!this.isLoaded || !window.cv) {
      return { isValidCard: false, detectionMethod: 'opencv_not_loaded' };
    }

    const cv = window.cv;
    let src: any, hsv: any, mask: any, contours: any, hierarchy: any;

    try {
      // Create OpenCV mat from image
      src = cv.imread(imageElement);
      hsv = new cv.Mat();
      mask = new cv.Mat();
      contours = new cv.MatVector();
      hierarchy = new cv.Mat();

      // Convert to HSV for better color detection
      cv.cvtColor(src, hsv, cv.COLOR_RGB2HSV);

      // Malaysian ID cards have distinctive blue/cyan colors
      // Define broader HSV range for blue/cyan regions to catch more card areas
      const lowerBlue = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [90, 30, 30, 0]);
      const upperBlue = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [140, 255, 255, 255]);
      
      // Create mask for blue regions
      cv.inRange(hsv, lowerBlue, upperBlue, mask);
      
      // Clean up the mask
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
      cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);
      kernel.delete();

      // Find contours in the blue regions
      cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      console.log(`Malaysian ID detection: Found ${contours.size()} blue regions`);

      // Find the best blue region and then refine its edges
      let bestBlueRegion: any = null;
      let bestBlueScore = 0;
      let bestBlueRect: any = null;

      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        const imageArea = src.rows * src.cols;
        const areaRatio = area / imageArea;

        // Look for regions that could be part of an ID card
        if (area > 2000 && areaRatio > 0.02 && areaRatio < 0.6) {
          const rect = cv.boundingRect(contour);
          const aspectRatio = rect.width / rect.height;
          
          // Check if this blue region has ID card proportions
          if (aspectRatio > 1.2 && aspectRatio < 2.2) {
            // Calculate how much of this rectangle is blue
            const roi = mask.roi(rect);
            const bluePixels = cv.countNonZero(roi);
            const totalPixels = rect.width * rect.height;
            const blueDensity = bluePixels / totalPixels;
            roi.delete();

            // Score based on size, aspect ratio, and blue content
            const score = area * (2.0 - Math.abs(aspectRatio - 1.586)) * blueDensity;
            
            console.log(`  Blue region ${i}: aspect=${aspectRatio.toFixed(2)}, blueDensity=${blueDensity.toFixed(2)}, score=${score.toFixed(0)}`);

            if (score > bestBlueScore && blueDensity > 0.05) { // At least 5% blue content
              bestBlueScore = score;
              if (bestBlueRegion) bestBlueRegion.delete();
              bestBlueRegion = contour.clone();
              bestBlueRect = rect;
            }
          }
        }
        contour.delete();
      }

      if (!bestBlueRegion) {
        lowerBlue.delete();
        upperBlue.delete();
        return { 
          isValidCard: false, 
          detectionMethod: 'color_detection_no_candidates',
          confidence: 0,
          aspectRatio: 0,
          area: 0
        };
      }

      // Now use edge detection within the blue region to find precise card edges
      const expandedRect = {
        x: Math.max(0, bestBlueRect.x - 20),
        y: Math.max(0, bestBlueRect.y - 20),
        width: Math.min(src.cols - bestBlueRect.x + 20, bestBlueRect.width + 40),
        height: Math.min(src.rows - bestBlueRect.y + 20, bestBlueRect.height + 40)
      };

      // Extract ROI around the blue region for precise edge detection
      const roiSrc = src.roi(new cv.Rect(expandedRect.x, expandedRect.y, expandedRect.width, expandedRect.height));
      const roiGray = new cv.Mat();
      const roiBlurred = new cv.Mat();
      const roiEdges = new cv.Mat();
      const roiContours = new cv.MatVector();
      const roiHierarchy = new cv.Mat();

      cv.cvtColor(roiSrc, roiGray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(roiGray, roiBlurred, new cv.Size(3, 3), 0);
      cv.Canny(roiBlurred, roiEdges, 50, 150);

      // Find contours in the ROI
      cv.findContours(roiEdges, roiContours, roiHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      console.log(`Found ${roiContours.size()} edge contours in blue region`);

      let bestCardCandidate: any = null;
      let bestScore = 0;
      let bestCorners: Array<{ x: number; y: number }> = [];

      // Look for the best rectangular contour in the ROI
      for (let i = 0; i < roiContours.size(); i++) {
        const contour = roiContours.get(i);
        const area = cv.contourArea(contour);
        
        if (area > 1000) { // Significant area within ROI
          // Try different epsilon values for polygon approximation
          for (const epsMultiplier of [0.02, 0.03, 0.05]) {
            const approx = new cv.Mat();
            const epsilon = epsMultiplier * cv.arcLength(contour, true);
            cv.approxPolyDP(contour, approx, epsilon, true);
            
            if (approx.rows === 4) {
              // Extract corners and convert back to original image coordinates
              const corners: Array<{ x: number; y: number }> = [];
              for (let j = 0; j < approx.rows; j++) {
                const point = approx.data32S.slice(j * 2, j * 2 + 2);
                corners.push({ 
                  x: point[0] + expandedRect.x, 
                  y: point[1] + expandedRect.y 
                });
              }
              
              // Calculate aspect ratio
              const [tl, tr, br, bl] = this.orderCorners(corners);
              const width1 = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
              const width2 = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
              const height1 = Math.sqrt(Math.pow(bl.x - tl.x, 2) + Math.pow(bl.y - tl.y, 2));
              const height2 = Math.sqrt(Math.pow(br.x - tr.x, 2) + Math.pow(br.y - tr.y, 2));
              
              const avgWidth = (width1 + width2) / 2;
              const avgHeight = (height1 + height2) / 2;
              const aspectRatio = avgWidth / avgHeight;
              
              if (aspectRatio > 1.2 && aspectRatio < 2.2) {
                const score = area * (2.0 - Math.abs(aspectRatio - 1.586));
                console.log(`    Edge candidate: aspect=${aspectRatio.toFixed(2)}, area=${area.toFixed(0)}, score=${score.toFixed(0)}`);
                
                if (score > bestScore) {
                  bestScore = score;
                  if (bestCardCandidate) bestCardCandidate.delete();
                  bestCardCandidate = contour.clone();
                  bestCorners = corners;
                }
              }
              approx.delete();
              break; // Found a good quadrilateral, no need to try other epsilon values
            }
            approx.delete();
          }
        }
        contour.delete();
      }

      // Cleanup ROI processing
      roiSrc.delete();
      roiGray.delete();
      roiBlurred.delete();
      roiEdges.delete();
      roiContours.delete();
      roiHierarchy.delete();

      // If no precise edges found, fall back to the blue region bounding box
      if (!bestCardCandidate) {
        console.log('No precise edges found, using blue region bounds');
        bestCorners = [
          { x: bestBlueRect.x, y: bestBlueRect.y },
          { x: bestBlueRect.x + bestBlueRect.width, y: bestBlueRect.y },
          { x: bestBlueRect.x + bestBlueRect.width, y: bestBlueRect.y + bestBlueRect.height },
          { x: bestBlueRect.x, y: bestBlueRect.y + bestBlueRect.height }
        ];
        bestCardCandidate = bestBlueRegion.clone();
        bestScore = bestBlueScore / 100; // Normalize for consistent scoring
      }

      lowerBlue.delete();
      upperBlue.delete();

      // Calculate final metrics using the best corners found
      const [tl, tr, br, bl] = this.orderCorners(bestCorners);
      const width1 = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
      const width2 = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
      const height1 = Math.sqrt(Math.pow(bl.x - tl.x, 2) + Math.pow(bl.y - tl.y, 2));
      const height2 = Math.sqrt(Math.pow(br.x - tr.x, 2) + Math.pow(br.y - tr.y, 2));
      
      const avgWidth = (width1 + width2) / 2;
      const avgHeight = (height1 + height2) / 2;
      const aspectRatio = avgWidth / avgHeight;
      
      // Calculate area from corners
      const cornerArea = avgWidth * avgHeight;
      const imageArea = src.rows * src.cols;
      const areaRatio = cornerArea / imageArea;
      
      // Improved confidence calculation
      const sizeScore = Math.min(1, areaRatio * 8); // Size bonus
      const aspectScore = Math.max(0, 1 - Math.abs(aspectRatio - 1.586) / 0.586); // Aspect ratio score
      const blueScore = Math.min(1, bestBlueScore / 50000); // Blue region score
      
      const confidence = Math.min(100, (sizeScore * 30 + aspectScore * 50 + blueScore * 20));

      // Calculate blur score for the detected region
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Create ROI from detected corners
      const minX = Math.max(0, Math.min(tl.x, tr.x, br.x, bl.x));
      const maxX = Math.min(src.cols, Math.max(tl.x, tr.x, br.x, bl.x));
      const minY = Math.max(0, Math.min(tl.y, tr.y, br.y, bl.y));
      const maxY = Math.min(src.rows, Math.max(tl.y, tr.y, br.y, bl.y));
      
      const roiRect = new cv.Rect(minX, minY, maxX - minX, maxY - minY);
      const roi = gray.roi(roiRect);
      const laplacian = new cv.Mat();
      cv.Laplacian(roi, laplacian, cv.CV_64F);
      const mean = new cv.Mat();
      const stddev = new cv.Mat();
      cv.meanStdDev(laplacian, mean, stddev);
      const blurScore = Math.pow(stddev.data64F[0], 2);
      
      laplacian.delete();
      mean.delete();
      stddev.delete();
      roi.delete();
      gray.delete();

      // Crop the detected card with enhanced quality
      let croppedImage: string | undefined;
      if (confidence > 20) {
        croppedImage = this.cropCard(src, bestCorners);
        
        // Apply additional sharpening for better text clarity
        if (croppedImage) {
          croppedImage = this.enhanceTextClarity(croppedImage);
        }
      }

      bestCardCandidate.delete();

      const result = {
        isValidCard: confidence > 40 && blurScore > 50 && aspectRatio > 1.2 && aspectRatio < 2.2,
        corners: bestCorners,
        croppedImage,
        blurScore,
        confidence,
        aspectRatio,
        area: areaRatio * 100,
        detectionMethod: 'malaysian_color_detection'
      };

      console.log(`Malaysian ID result: confidence=${confidence.toFixed(1)}, blur=${blurScore.toFixed(1)}, aspectRatio=${aspectRatio.toFixed(2)}, valid=${result.isValidCard}`);
      console.log(`  Scores: size=${sizeScore.toFixed(2)}, aspect=${aspectScore.toFixed(2)}, blue=${blueScore.toFixed(2)}`);
      
      return result;

    } catch (error) {
      console.error('Error in Malaysian ID detection:', error);
      return { isValidCard: false, detectionMethod: 'error' };
    } finally {
      // Clean up OpenCV mats
      [src, hsv, mask, contours, hierarchy].forEach(mat => {
        if (mat && typeof mat.delete === 'function') {
          mat.delete();
        }
      });
    }
  }

  /**
   * Detects ID card edges and returns detection results (fallback method)
   */
  detectCardEdges(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): DetectionResult {
    if (!this.isLoaded || !window.cv) {
      return { isValidCard: false };
    }

    const cv = window.cv;
    let src: any, gray: any, blurred: any, edges: any, contours: any, hierarchy: any;

    try {
      // Create OpenCV mat from image
      src = cv.imread(imageElement);
      gray = new cv.Mat();
      blurred = new cv.Mat();
      edges = new cv.Mat();
      contours = new cv.MatVector();
      hierarchy = new cv.Mat();

      // Convert to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Calculate blur score using Laplacian variance
      const laplacian = new cv.Mat();
      cv.Laplacian(gray, laplacian, cv.CV_64F);
      const mean = new cv.Mat();
      const stddev = new cv.Mat();
      cv.meanStdDev(laplacian, mean, stddev);
      const blurScore = Math.pow(stddev.data64F[0], 2);
      laplacian.delete();
      mean.delete();
      stddev.delete();

      // Try different preprocessing approaches for better edge detection
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // More sensitive edge detection
      cv.Canny(blurred, edges, 30, 120);

      // Find contours
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      // Debug: log basic info (less frequent)
      if (contours.size() > 0) {
        console.log(`Processing ${contours.size()} contours, image size: ${src.cols}x${src.rows}`);
      }

      // Find the largest rectangular contour (potential ID card)
      let bestContour: any = null;
      let maxArea = 0;
      let bestApprox: any = null;

      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        
        // Calculate image area for relative sizing
        const imageArea = src.rows * src.cols;
        const areaRatio = area / imageArea;
        
        // Log significant contours less frequently
        if (area > 5000) {
          console.log(`Large contour ${i}: area=${area.toFixed(0)}, areaRatio=${(areaRatio*100).toFixed(1)}%`);
        }

        // ID card can be any reasonable size - just needs to be visible
        if (area > 1000 && areaRatio > 0.01 && areaRatio < 0.9) {
          // Try multiple approximation levels to find the best quadrilateral
          let bestApproxForContour: any = null;
          let bestCornerCount = 0;
          
          // Try different epsilon values to find a good approximation
          for (const epsMultiplier of [0.02, 0.03, 0.05, 0.08, 0.1]) {
            const approx = new cv.Mat();
            const epsilon = epsMultiplier * cv.arcLength(contour, true);
            cv.approxPolyDP(contour, approx, epsilon, true);
            
            // Prefer quadrilaterals, but accept 3-6 corners if that's the best we can get
            if (approx.rows >= 3 && approx.rows <= 6) {
              if (approx.rows === 4 || !bestApproxForContour) {
                if (bestApproxForContour) bestApproxForContour.delete();
                bestApproxForContour = approx.clone();
                bestCornerCount = approx.rows;
              }
              if (approx.rows === 4) {
                approx.delete();
                break; // Found perfect quadrilateral
              }
            }
            approx.delete();
          }
          
          if (!bestApproxForContour) continue;

          // Debug: log all polygon approximations
          console.log(`  Contour ${i}: ${bestCornerCount} corners, area=${area.toFixed(0)}`);
          
          // Work with the best approximation we found (prefer 4 corners but accept 3-6)
          console.log(`Found ${bestCornerCount}-sided polygon: area=${area.toFixed(0)}, areaRatio=${(areaRatio*100).toFixed(1)}%`);
          
          // Extract corners for aspect ratio calculation
          const corners: Array<{ x: number; y: number }> = [];
          for (let j = 0; j < bestApproxForContour.rows; j++) {
            const point = bestApproxForContour.data32S.slice(j * 2, j * 2 + 2);
            corners.push({ x: point[0], y: point[1] });
          }
          
          // For non-quadrilaterals, find the bounding rectangle corners
          let rectangleCorners = corners;
          if (bestCornerCount !== 4) {
            const rect = cv.boundingRect(contour);
            rectangleCorners = [
              { x: rect.x, y: rect.y },
              { x: rect.x + rect.width, y: rect.y },
              { x: rect.x + rect.width, y: rect.y + rect.height },
              { x: rect.x, y: rect.y + rect.height }
            ];
          }
            
          // Calculate aspect ratio using rectangle corners
          const [tl, tr, br, bl] = this.orderCorners(rectangleCorners);
          const width1 = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
          const width2 = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
          const height1 = Math.sqrt(Math.pow(bl.x - tl.x, 2) + Math.pow(bl.y - tl.y, 2));
          const height2 = Math.sqrt(Math.pow(br.x - tr.x, 2) + Math.pow(br.y - tr.y, 2));
          
          const avgWidth = (width1 + width2) / 2;
          const avgHeight = (height1 + height2) / 2;
          const aspectRatio = avgWidth / avgHeight;
            
          // MyKad aspect ratio is approximately 1.586 (85.6mm x 53.98mm)
          // Accept broader aspect ratios to account for perspective and angle
          if (aspectRatio > 1.0 && aspectRatio < 3.0) {
            // Calculate rectangularity (how close to rectangle)
            const rect = cv.boundingRect(contour);
            const rectArea = rect.width * rect.height;
            const rectangularity = area / rectArea;
            
            // Should be fairly rectangular (> 0.5) - more permissive
            if (rectangularity > 0.5) {
              // Calculate convexity
              const hull = new cv.Mat();
              cv.convexHull(contour, hull);
              const hullArea = cv.contourArea(hull);
              const convexity = area / hullArea;
              hull.delete();
              
              // Should be fairly convex (> 0.7) - more permissive
              if (convexity > 0.7) {
                // Score this candidate
                const score = area * rectangularity * convexity * (2.0 - Math.abs(aspectRatio - 1.586));
                
                console.log(`  Candidate: aspectRatio=${aspectRatio.toFixed(2)}, rectangularity=${rectangularity.toFixed(2)}, convexity=${convexity.toFixed(2)}, score=${score.toFixed(0)}`);
                
                if (score > maxArea) {
                  maxArea = score;
                  if (bestContour) bestContour.delete();
                  if (bestApprox) bestApprox.delete();
                  bestContour = contour.clone();
                  bestApprox = bestApproxForContour.clone();
                }
              }
            }
          }
          bestApproxForContour.delete();
        }
        contour.delete();
      }

      if (!bestContour || !bestApprox) {
        return { 
          isValidCard: false, 
          blurScore,
          confidence: 0,
          aspectRatio: 0,
          area: 0
        };
      }

      // Extract corners - recalculate since we may have used bounding rect
      const corners: Array<{ x: number; y: number }> = [];
      if (bestApprox.rows === 4) {
        // Use actual detected corners
        for (let i = 0; i < bestApprox.rows; i++) {
          const point = bestApprox.data32S.slice(i * 2, i * 2 + 2);
          corners.push({ x: point[0], y: point[1] });
        }
      } else {
        // Use bounding rectangle corners for non-quadrilaterals
        const rect = cv.boundingRect(bestContour);
        corners.push(
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width, y: rect.y },
          { x: rect.x + rect.width, y: rect.y + rect.height },
          { x: rect.x, y: rect.y + rect.height }
        );
      }

      // Recalculate metrics for the best detected contour
      const contourArea = cv.contourArea(bestContour);
      const imageArea = src.rows * src.cols;
      const areaRatio = contourArea / imageArea;
      
      // Calculate aspect ratio of detected rectangle
      const [tl, tr, br, bl] = this.orderCorners(corners);
      const width1 = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
      const width2 = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
      const height1 = Math.sqrt(Math.pow(bl.x - tl.x, 2) + Math.pow(bl.y - tl.y, 2));
      const height2 = Math.sqrt(Math.pow(br.x - tr.x, 2) + Math.pow(br.y - tr.y, 2));
      
      const avgWidth = (width1 + width2) / 2;
      const avgHeight = (height1 + height2) / 2;
      const aspectRatio = avgWidth / avgHeight;
      
      // Calculate rectangularity and convexity for confidence
      const rect = cv.boundingRect(bestContour);
      const rectArea = rect.width * rect.height;
      const rectangularity = contourArea / rectArea;
      
      const hull = new cv.Mat();
      cv.convexHull(bestContour, hull);
      const hullArea = cv.contourArea(hull);
      const convexity = contourArea / hullArea;
      hull.delete();
      
      // Ideal MyKad aspect ratio is 1.586
      const aspectRatioScore = Math.max(0, 1 - Math.abs(aspectRatio - 1.586) / 0.586);
      
      // Calculate overall confidence (0-100) - more flexible on size
      const sizeScore = Math.min(1, areaRatio * 10); // Size bonus, but not required
      const confidence = Math.min(100, (
        sizeScore * 15 +           // Size bonus (less important)
        aspectRatioScore * 50 +    // Aspect ratio is most important for ID card
        rectangularity * 25 +      // Should be rectangular
        convexity * 10             // Should be convex (not concave)
      ));

      // Crop the detected card with enhanced quality
      let croppedImage: string | undefined;
      if (confidence > 30) { // Only crop if confidence is reasonable
        croppedImage = this.cropCard(src, corners);
        
        // Apply additional sharpening for better text clarity
        if (croppedImage) {
          croppedImage = this.enhanceTextClarity(croppedImage);
        }
      }

      // Clean up
      bestContour.delete();
      bestApprox.delete();

      // Very permissive validation for debugging - prioritize detection over quality
      const hasGoodShape = aspectRatio > 1.0 && aspectRatio < 3.0 && rectangularity > 0.5 && convexity > 0.7;
      const hasGoodQuality = blurScore > 30; // Very forgiving on blur for testing
      const hasReasonableConfidence = confidence > 20; // Very forgiving confidence
      
      const result = {
        isValidCard: hasGoodShape && hasGoodQuality && hasReasonableConfidence,
        corners,
        croppedImage,
        blurScore,
        confidence,
        aspectRatio,
        area: areaRatio * 100, // Area as percentage of image
        detectionMethod: 'edge_detection' as string
      };

      console.log(`Final result: confidence=${confidence.toFixed(1)}, blur=${blurScore.toFixed(1)}, aspectRatio=${aspectRatio.toFixed(2)}, valid=${result.isValidCard}`);
      console.log(`Validation: shape=${hasGoodShape}, quality=${hasGoodQuality}, confidence=${hasReasonableConfidence}`);

      return result;

    } catch (error) {
      console.error('Error in card detection:', error);
      return { isValidCard: false, detectionMethod: 'edge_detection_error' };
    } finally {
      // Clean up OpenCV mats
      [src, gray, blurred, edges, contours, hierarchy].forEach(mat => {
        if (mat && typeof mat.delete === 'function') {
          mat.delete();
        }
      });
    }
  }

  /**
   * Hybrid detection method - tries Malaysian-specific detection first, then edge detection
   */
  detectCard(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): DetectionResult {
    // Try Malaysian-specific detection first
    const malaysianResult = this.detectMalaysianIDCard(imageElement);
    
    if (malaysianResult.isValidCard || (malaysianResult.confidence || 0) > 40) {
      console.log('Using Malaysian ID detection result');
      return malaysianResult;
    }
    
    // Fall back to edge detection
    console.log('Falling back to edge detection');
    const edgeResult = this.detectCardEdges(imageElement);
    
    // Return the better result
    if ((edgeResult.confidence || 0) > (malaysianResult.confidence || 0)) {
      return edgeResult;
    } else {
      return malaysianResult;
    }
  }

  /**
   * Orders corners in a consistent manner: top-left, top-right, bottom-right, bottom-left
   */
  private orderCorners(corners: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    // Sort by y coordinate
    corners.sort((a, b) => a.y - b.y);
    
    // Top two points
    const topPoints = corners.slice(0, 2);
    const bottomPoints = corners.slice(2, 4);
    
    // Sort top points by x coordinate
    topPoints.sort((a, b) => a.x - b.x);
    // Sort bottom points by x coordinate  
    bottomPoints.sort((a, b) => a.x - b.x);
    
    return [
      topPoints[0],    // top-left
      topPoints[1],    // top-right
      bottomPoints[1], // bottom-right
      bottomPoints[0]  // bottom-left
    ];
  }

  /**
   * Crops the card using perspective transformation
   */
  private cropCard(src: any, corners: Array<{ x: number; y: number }>): string {
    const cv = window.cv;
    
    // Order corners
    const [tl, tr, br, bl] = this.orderCorners(corners);
    
    // Calculate dimensions for output image
    const width1 = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
    const width2 = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
    const height1 = Math.sqrt(Math.pow(bl.x - tl.x, 2) + Math.pow(bl.y - tl.y, 2));
    const height2 = Math.sqrt(Math.pow(br.x - tr.x, 2) + Math.pow(br.y - tr.y, 2));
    
    const maxWidth = Math.max(width1, width2);
    const maxHeight = Math.max(height1, height2);
    
    // Source points (detected corners)
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      tl.x, tl.y,
      tr.x, tr.y,
      br.x, br.y,
      bl.x, bl.y
    ]);
    
    // Destination points (rectangle)
    const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      maxWidth, 0,
      maxWidth, maxHeight,
      0, maxHeight
    ]);
    
    // Get perspective transformation matrix
    const M = cv.getPerspectiveTransform(srcPts, dstPts);
    
    // Apply perspective transformation
    const warped = new cv.Mat();
    cv.warpPerspective(src, warped, M, new cv.Size(maxWidth, maxHeight));
    
    // Convert to canvas and get data URL with higher quality
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, warped);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95); // Higher quality for better text storage
    
    // Clean up
    srcPts.delete();
    dstPts.delete();
    M.delete();
    warped.delete();
    
    return dataUrl;
  }

  /**
   * Enhances text clarity in the cropped card image
   */
  private enhanceTextClarity(croppedImageData: string): string {
    if (!this.isLoaded || !window.cv) {
      return croppedImageData;
    }

    const cv = window.cv;
    let src: any, enhanced: any, gray: any, sharpened: any;

    try {
      // Create a temporary canvas from the cropped image data
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return croppedImageData;

      // Load the image data synchronously
      const img = new Image();
      const originalLoad = img.onload;
      img.onload = null; // Disable async loading
      img.src = croppedImageData;

      // Set canvas dimensions and draw image
      tempCanvas.width = img.naturalWidth || img.width;
      tempCanvas.height = img.naturalHeight || img.height;
      tempCtx.drawImage(img, 0, 0);

      // Create OpenCV mat from canvas
      src = cv.imread(tempCanvas);
      enhanced = new cv.Mat();
      gray = new cv.Mat();
      sharpened = new cv.Mat();

      // Convert to grayscale for text enhancement
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Apply unsharp mask for better text sharpness
      const blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(0, 0), 1.2);
      cv.addWeighted(gray, 1.6, blurred, -0.6, 0, sharpened);
      blurred.delete();

      // Convert back to color
      cv.cvtColor(sharpened, enhanced, cv.COLOR_GRAY2RGBA);

      // Apply contrast enhancement
      const alpha = 1.3; // Contrast control (1.0-3.0)
      const beta = 10;   // Brightness control (0-100)
      enhanced.convertTo(enhanced, -1, alpha, beta);

      // Convert back to canvas and get enhanced data URL
      const enhancedCanvas = document.createElement('canvas');
      cv.imshow(enhancedCanvas, enhanced);
      const enhancedDataUrl = enhancedCanvas.toDataURL('image/jpeg', 0.98);

      console.log('Text enhancement applied successfully');
      return enhancedDataUrl;

    } catch (error) {
      console.error('Error in text enhancement:', error);
      return croppedImageData; // Return original if enhancement fails
    } finally {
      // Clean up OpenCV mats
      [src, enhanced, gray, sharpened].forEach(mat => {
        if (mat && typeof mat.delete === 'function') {
          mat.delete();
        }
      });
    }
  }

  /**
   * Draws detection overlay on canvas (transparent overlay, no video redraw)
   */
  drawDetectionOverlay(
    canvas: HTMLCanvasElement, 
    videoElement: HTMLVideoElement,
    result: DetectionResult
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const scaleX = canvas.width / videoElement.videoWidth;
    const scaleY = canvas.height / videoElement.videoHeight;

    // Always draw guide rectangle first
    ctx.strokeStyle = result.corners?.length === 4 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = result.corners?.length === 4 ? 1 : 2;
    ctx.setLineDash([10, 10]);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const guideWidth = canvas.width * 0.7;
    const guideHeight = guideWidth / 1.6; // ID card aspect ratio
    
    const left = centerX - guideWidth / 2;
    const top = centerY - guideHeight / 2;
    
    ctx.strokeRect(left, top, guideWidth, guideHeight);
    ctx.setLineDash([]);

    // Add corner markers to guide rectangle
    if (!result.corners || result.corners.length !== 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const cornerSize = 20;
      const corners = [
        { x: left, y: top },
        { x: left + guideWidth, y: top },
        { x: left + guideWidth, y: top + guideHeight },
        { x: left, y: top + guideHeight }
      ];
      
      corners.forEach(corner => {
        // Draw corner L shapes
        ctx.fillRect(corner.x - 2, corner.y - 2, cornerSize, 4);
        ctx.fillRect(corner.x - 2, corner.y - 2, 4, cornerSize);
      });
    }

    // Draw detected bounds if any corners are found
    if (result.corners && result.corners.length === 4) {
      // Determine color based on validity
      const strokeColor = result.isValidCard ? '#22c55e' : '#fbbf24'; // green if valid, yellow if detected but not valid
      const fillColor = result.isValidCard ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)';
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.fillStyle = fillColor;

      // Draw detected rectangle with corners
      ctx.beginPath();
      result.corners.forEach((corner, index) => {
        const x = corner.x * scaleX;
        const y = corner.y * scaleY;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw corner points
      ctx.fillStyle = strokeColor;
      result.corners.forEach(corner => {
        const x = corner.x * scaleX;
        const y = corner.y * scaleY;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add a white center for better visibility
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = strokeColor;
      });
    }

    // Draw status information with better visibility
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    // Background for text
    // Status text with detection method
    const baseStatus = result.isValidCard ? 'Card Ready ✓' : 
                      (result.corners?.length === 4 ? 'Card Detected - Position Better' : 'Position Card in Frame');
    const methodText = result.detectionMethod ? ` (${result.detectionMethod.replace('_', ' ')})` : '';
    const statusText = baseStatus + methodText;
    const textWidth = ctx.measureText(statusText).width;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(15, 15, textWidth + 20, 35);
    
    // Status text
    ctx.fillStyle = result.isValidCard ? '#22c55e' : '#fbbf24';
    ctx.fillText(statusText, 25, 38);

    // Additional info
    if (result.blurScore || result.confidence) {
      const infoY = 65;
      let infoText = '';
      
      if (result.confidence !== undefined) {
        infoText += `Confidence: ${result.confidence.toFixed(0)}%`;
      }
      if (result.blurScore !== undefined) {
        if (infoText) infoText += ' | ';
        infoText += `Sharpness: ${result.blurScore.toFixed(0)}`;
      }
      
      if (infoText) {
        const infoWidth = ctx.measureText(infoText).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(15, infoY - 20, infoWidth + 20, 30);
        
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(infoText, 25, infoY - 5);
      }
    }

    // Show detection requirements when no valid card
    if (!result.isValidCard && result.corners && result.corners.length === 4) {
      const requirementsY = 95;
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(15, requirementsY - 15, 300, 50);
      
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Requirements: Confidence > 20%, Sharpness > 30', 25, requirementsY);
      ctx.fillText('Aspect ratio: 1.0-3.0 (ID card shape)', 25, requirementsY + 15);
      ctx.fillText('Position card flat with all corners visible', 25, requirementsY + 30);
    }
  }
}

// Singleton instance
export const openCVManager = OpenCVManager.getInstance();
