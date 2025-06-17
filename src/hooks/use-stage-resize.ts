
import { useState, useEffect, useCallback, useRef } from 'react';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './use-app-selector';
import { setScale } from '~/store/slices/frame-slice';
import useKeyPress from './use-key-press';
import { FRAME_CONTAINER_PADDING } from '~/consts/components';
import { KeyType } from '~/consts/keys';
import { canvasBoundsManager } from '~/utils/canvas-bounds';
import { useAppContext } from '~/context/AppContext';

type Props = {
  stageRef?: React.RefObject<Konva.Stage | null> | null;
};

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const useStageResizeFixed = ({ stageRef }: Props) => {
  const dispatch = useDispatch();
  const { scale } = useAppSelector((state) => state.frame);
  const { getCurrentView } = useAppContext();

  const [containerDimensions, setContainerDimensions] = useState({
    width: 500,
    height: 500
  });

  const isUpdatingRef = useRef(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastUpdateTimeRef = useRef(0);

  const isKeyPressed = useKeyPress(KeyType.DRAG_STAGE);

  // Constants
  const ZOOM_MIN = 0.05;
  const ZOOM_MAX = 10;
  const ZOOM_STEP = 1.2;
  const RESIZE_DEBOUNCE = 150; 
  const MIN_UPDATE_INTERVAL = 100;

  // Get container element safely
  const getContainer = useCallback(() => {
    if (!containerRef.current) {
      containerRef.current = document.querySelector('.canvas-container') as HTMLElement;
    }
    return containerRef.current;
  }, []);

  // Get canvas bounds from current view
  const getCanvasBounds = useCallback(() => {
    const currentView = getCurrentView();
    if (currentView?.canvas) {
      return {
        width: currentView.canvas.width,
        height: currentView.canvas.height,
        x: 0,
        y: 0
      };
    }
    
    // Fallback to default
    return {
      width: 1080,
      height: 1080,
      x: 0,
      y: 0
    };
  }, [getCurrentView]);

  // Stable container dimension update
  const updateContainerDimensions = useCallback(
    debounce(() => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < MIN_UPDATE_INTERVAL) {
        return; // Skip rapid updates
      }
      lastUpdateTimeRef.current = now;

      const container = getContainer();
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newWidth = Math.max(200, rect.width - (FRAME_CONTAINER_PADDING * 2));
      const newHeight = Math.max(200, rect.height - (FRAME_CONTAINER_PADDING * 2));

      // Only update if significantly different (avoid micro-updates)
      setContainerDimensions(prev => {
        const widthDiff = Math.abs(prev.width - newWidth);
        const heightDiff = Math.abs(prev.height - newHeight);
        
        if (widthDiff < 5 && heightDiff < 5) {
          return prev; // No significant change
        }

        return { width: newWidth, height: newHeight };
      });
    }, RESIZE_DEBOUNCE),
    [getContainer]
  );

  // Stable stage positioning
  const centerStageInContainer = useCallback(() => {
    if (!stageRef?.current || isUpdatingRef.current) return;

    const stage = stageRef.current;
    const canvasBounds = getCanvasBounds();
    
    // Update bounds manager
    canvasBoundsManager.updateBounds(canvasBounds);
    
    const currentScale = stage.scaleX();
    const scaledWidth = canvasBounds.width * currentScale;
    const scaledHeight = canvasBounds.height * currentScale;

    // Calculate center position
    let newX = (containerDimensions.width - scaledWidth) / 2;
    let newY = (containerDimensions.height - scaledHeight) / 2;

    // If content is larger than container, constrain to edges
    if (scaledWidth > containerDimensions.width) {
      newX = Math.min(0, Math.max(containerDimensions.width - scaledWidth, newX));
    }
    if (scaledHeight > containerDimensions.height) {
      newY = Math.min(0, Math.max(containerDimensions.height - scaledHeight, newY));
    }

    // Apply position smoothly
    isUpdatingRef.current = true;
    stage.to({
      x: newX,
      y: newY,
      duration: 0.2, // Smooth transition
      onFinish: () => {
        isUpdatingRef.current = false;
      }
    });

  }, [stageRef, containerDimensions, getCanvasBounds]);

  // Stable scale application
  const applyScale = useCallback((newScale: number, pointer?: { x: number; y: number }) => {
    if (!stageRef?.current || isUpdatingRef.current) return newScale;

    const stage = stageRef.current;
    const constrainedScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));

    isUpdatingRef.current = true;

    if (pointer) {
      // Zoom to point logic
      const oldScale = stage.scaleX();
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * constrainedScale,
        y: pointer.y - mousePointTo.y * constrainedScale,
      };

      stage.scale({ x: constrainedScale, y: constrainedScale });
      stage.position(newPos);
    } else {
      stage.scale({ x: constrainedScale, y: constrainedScale });
    }

    // Update Redux state
    dispatch(setScale({ scale: constrainedScale }));
    stage.batchDraw();

    // Reset flag after brief delay
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);

    return constrainedScale;
  }, [stageRef, dispatch]);

  // Calculate initial scale to fit canvas in container
  const calculateFitScale = useCallback(() => {
    const canvasBounds = getCanvasBounds();
    const wScale = containerDimensions.width / canvasBounds.width;
    const hScale = containerDimensions.height / canvasBounds.height;
    return Math.min(wScale, hScale) * 0.9; // 90% of max fit for padding
  }, [containerDimensions, getCanvasBounds]);

  // Initialize stage size and position
  const initializeStage = useCallback(() => {
    if (!stageRef?.current) return;

    const canvasBounds = getCanvasBounds();
    canvasBoundsManager.updateBounds(canvasBounds);

    const fitScale = calculateFitScale();
    applyScale(fitScale);
    
    // Center after scale is applied
    setTimeout(() => {
      centerStageInContainer();
    }, 100);
  }, [stageRef, calculateFitScale, applyScale, centerStageInContainer]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    if (!stageRef?.current) return;
    const currentScale = stageRef.current.scaleX();
    applyScale(currentScale * ZOOM_STEP);
  }, [stageRef, applyScale]);

  const zoomOut = useCallback(() => {
    if (!stageRef?.current) return;
    const currentScale = stageRef.current.scaleX();
    applyScale(currentScale / ZOOM_STEP);
  }, [stageRef, applyScale]);

  const resetZoom = useCallback(() => {
    const fitScale = calculateFitScale();
    applyScale(fitScale);
    setTimeout(() => centerStageInContainer(), 100);
  }, [calculateFitScale, applyScale, centerStageInContainer]);

  const fitToCanvas = useCallback(() => {
    const canvasBounds = getCanvasBounds();
    const wScale = containerDimensions.width / canvasBounds.width;
    const hScale = containerDimensions.height / canvasBounds.height;
    const fillScale = Math.max(wScale, hScale) * 0.95;
    
    applyScale(fillScale);
    setTimeout(() => centerStageInContainer(), 100);
  }, [containerDimensions, getCanvasBounds, applyScale, centerStageInContainer]);

  // Wheel zoom handler
  const handleZoom = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    if (!stageRef?.current) return;

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    let direction = e.evt.deltaY > 0 ? 1 : -1;
    if (e.evt.ctrlKey) direction = -direction;

    const oldScale = stage.scaleX();
    const newScale = direction > 0 ? oldScale * ZOOM_STEP : oldScale / ZOOM_STEP;

    applyScale(newScale, pointer);
  }, [stageRef, applyScale]);

  //  Drag handler with bounds checking
  const handleDragMoveStage = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (!isKeyPressed || !stageRef?.current) return;

    e.evt.preventDefault();
    e.evt.stopPropagation();

    const stage = stageRef.current;
    const canvasBounds = getCanvasBounds();
    const currentScale = stage.scaleX();
    
    // Get current position
    const pos = stage.position();
    
    // Calculate bounds for stage position
    const scaledCanvasWidth = canvasBounds.width * currentScale;
    const scaledCanvasHeight = canvasBounds.height * currentScale;
    
    // Constrain stage position
    let constrainedX = pos.x;
    let constrainedY = pos.y;
    
    if (scaledCanvasWidth <= containerDimensions.width) {
      // Center if canvas fits
      constrainedX = (containerDimensions.width - scaledCanvasWidth) / 2;
    } else {
      // Constrain to edges
      constrainedX = Math.min(0, Math.max(containerDimensions.width - scaledCanvasWidth, pos.x));
    }
    
    if (scaledCanvasHeight <= containerDimensions.height) {
      // Center if canvas fits
      constrainedY = (containerDimensions.height - scaledCanvasHeight) / 2;
    } else {
      // Constrain to edges
      constrainedY = Math.min(0, Math.max(containerDimensions.height - scaledCanvasHeight, pos.y));
    }
    
    // Apply constrained position if different
    if (constrainedX !== pos.x || constrainedY !== pos.y) {
      stage.position({ x: constrainedX, y: constrainedY });
    }
  }, [isKeyPressed, stageRef, getCanvasBounds, containerDimensions]);

  //  Single ResizeObserver setup
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    // Cleanup previous observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Create new observer
    resizeObserverRef.current = new ResizeObserver(() => {
      // Use RAF to avoid layout thrashing
      requestAnimationFrame(() => {
        updateContainerDimensions();
      });
    });

    resizeObserverRef.current.observe(container);

    // Cleanup
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [updateContainerDimensions, getContainer]);

  // Re-center when container dimensions change
  useEffect(() => {
    if (containerDimensions.width > 0 && containerDimensions.height > 0) {
      // Debounce the centering to avoid rapid updates
      const timer = setTimeout(() => {
        centerStageInContainer();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [containerDimensions, centerStageInContainer]);

  // Initialize on mount and view changes
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeStage();
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeStage]);

  // Get current scale for UI display
  const getCurrentScale = useCallback(() => {
    return stageRef?.current?.scaleX() || scale || 1;
  }, [stageRef, scale]);

  return {
    boxWidth: containerDimensions.width,
    boxHeight: containerDimensions.height,
    handleZoom,
    handleDragMoveStage,
    resetZoom,
    fitToCanvas,
    zoomIn,
    zoomOut,
    setZoomToPercentage: (percentage: number) => {
      applyScale(percentage / 100);
    },
    currentScale: getCurrentScale(),
    canZoomIn: getCurrentScale() < ZOOM_MAX,
    canZoomOut: getCurrentScale() > ZOOM_MIN,
    
    // New bounds-aware functions
    centerStage: centerStageInContainer,
    getCanvasBounds,
  };
};

export default useStageResizeFixed;