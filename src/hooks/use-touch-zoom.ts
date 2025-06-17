import { useCallback, useRef, useState } from 'react';
import Konva from 'konva';

interface TouchZoomOptions {
  minScale?: number;
  maxScale?: number;
  onZoomChange?: (scale: number, center: { x: number; y: number }) => void;
}

interface TouchZoomState {
  isZooming: boolean;
  initialDistance: number;
  initialScale: number;
  center: { x: number; y: number };
}

export const useTouchZoom = (
  stageRef: React.RefObject<Konva.Stage>,
  options: TouchZoomOptions = {}
) => {
  const {
    minScale = 0.1,
    maxScale = 5,
    onZoomChange
  } = options;

  const zoomStateRef = useRef<TouchZoomState>({
    isZooming: false,
    initialDistance: 0,
    initialScale: 1,
    center: { x: 0, y: 0 }
  });

  const [isZooming, setIsZooming] = useState(false);

  // Calculate distance between two touches
  const getTouchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Get center point between two touches in stage coordinates
  const getTouchCenter = useCallback((touches: TouchList): { x: number; y: number } => {
    if (!stageRef.current || touches.length < 2) {
      return { x: 0, y: 0 };
    }

    const stage = stageRef.current;
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    // Get center in client coordinates
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    // Convert to stage coordinates
    const stageBox = stage.container().getBoundingClientRect();
    const stagePos = stage.position();
    const stageScale = stage.scaleX();
    
    return {
      x: (centerX - stageBox.left - stagePos.x) / stageScale,
      y: (centerY - stageBox.top - stagePos.y) / stageScale
    };
  }, [stageRef]);

  // Apply zoom transformation
  const applyZoom = useCallback((
    newScale: number, 
    center: { x: number; y: number }
  ) => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const constrainedScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    // Calculate new position to zoom towards center point
    const oldScale = stage.scaleX();
    const pointer = center;
    
    const newPos = {
      x: pointer.x - (pointer.x - stage.x()) * (constrainedScale / oldScale),
      y: pointer.y - (pointer.y - stage.y()) * (constrainedScale / oldScale)
    };

    // Apply transformation
    stage.scale({ x: constrainedScale, y: constrainedScale });
    stage.position(newPos);
    stage.batchDraw();

    // Notify zoom change
    onZoomChange?.(constrainedScale, center);
  }, [stageRef, minScale, maxScale, onZoomChange]);

  // Touch start handler
  const handleTouchStart = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    
    // Only handle two-finger gestures
    if (touches.length !== 2) {
      return;
    }

    // Prevent default to avoid scrolling
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const distance = getTouchDistance(touches);
    const center = getTouchCenter(touches);
    
    zoomStateRef.current = {
      isZooming: true,
      initialDistance: distance,
      initialScale: stage.scaleX(),
      center
    };
    
    setIsZooming(true);
    
    console.log('🎯 Touch zoom started');
  }, [stageRef, getTouchDistance, getTouchCenter]);

  // Touch move handler
  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    const zoomState = zoomStateRef.current;
    
    // Only process if we're in zoom mode with 2 fingers
    if (!zoomState.isZooming || touches.length !== 2) {
      return;
    }

    e.evt.preventDefault();
    
    const currentDistance = getTouchDistance(touches);
    // const currentCenter = getTouchCenter(touches);
    
    if (zoomState.initialDistance === 0) return;
    
    // Calculate scale based on distance change
    const scaleChange = currentDistance / zoomState.initialDistance;
    const newScale = zoomState.initialScale * scaleChange;
    
    // Apply zoom using the initial center point for consistency
    applyZoom(newScale, zoomState.center);
    
  }, [getTouchDistance, getTouchCenter, applyZoom]);

  // Touch end handler
  const handleTouchEnd = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    
    // End zoom when less than 2 fingers
    if (touches.length < 2 && zoomStateRef.current.isZooming) {
      zoomStateRef.current.isZooming = false;
      setIsZooming(false);
      
      console.log('🎯 Touch zoom ended');
    }
  }, []);

  // Clean up on touch cancel
  const handleTouchCancel = useCallback(() => {
    if (zoomStateRef.current.isZooming) {
      zoomStateRef.current.isZooming = false;
      setIsZooming(false);
      
      console.log('🎯 Touch zoom cancelled');
    }
  }, []);

  return {
    // State
    isZooming,
    
    // Handlers for Konva Stage
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    
    // Manual zoom methods
    zoomIn: () => {
      if (!stageRef.current) return;
      const stage = stageRef.current;
      const center = {
        x: stage.width() / 2,
        y: stage.height() / 2
      };
      applyZoom(stage.scaleX() * 1.2, center);
    },
    
    zoomOut: () => {
      if (!stageRef.current) return;
      const stage = stageRef.current;
      const center = {
        x: stage.width() / 2,
        y: stage.height() / 2
      };
      applyZoom(stage.scaleX() / 1.2, center);
    }
  };
};