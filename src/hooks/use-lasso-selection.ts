import { useState, useCallback, useRef, useEffect } from 'react';
import Konva from 'konva';
import { useCanvasContexts } from './use-canvas-contexts';

export interface LassoPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface LassoSelectionOptions {
  minDistance: number;
  smoothingFactor: number;
  selectionSensitivity: number;
  autoCloseDistance: number;
}

export const useLassoSelection = (
  stageRef: React.RefObject<Konva.Stage | null>,
  options: LassoSelectionOptions = {
    minDistance: 5,
    smoothingFactor: 0.3,
    selectionSensitivity: 0.6,
    autoCloseDistance: 30,
  }
) => {
  // Core lasso state
  const [isLassoMode, setIsLassoMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<LassoPoint[]>([]);
  const [smoothedPoints, setSmoothedPoints] = useState<LassoPoint[]>([]);
  const [previewSelection, setPreviewSelection] = useState<string[]>([]);
  const [lockedSelection, setLockedSelection] = useState<string[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Group movement state
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [isAutoClosing, setIsAutoClosing] = useState(false);

  const { objects: stageObjects, updateSelection } = useCanvasContexts();
  
  const drawingStateRef = useRef({
    lastPoint: null as LassoPoint | null,
    startTime: 0,
    totalDistance: 0,
    velocity: 0,
    isTouch: false,
  });

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // UTILITY FUNCTIONS
  const isPointInPolygon = useCallback((point: LassoPoint, polygon: LassoPoint[]): boolean => {
    if (polygon.length < 3) return false;
    let inside = false;
    let j = polygon.length - 1;
    for (let i = 0; i < polygon.length; i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      if (((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }, []);

  const getDistance = useCallback((p1: LassoPoint, p2: LassoPoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  const smoothPoints = useCallback((points: LassoPoint[]): LassoPoint[] => {
    if (points.length < 3) return points;
    const smoothed: LassoPoint[] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1], curr = points[i], next = points[i + 1];
      const smoothedX = curr.x + options.smoothingFactor * (prev.x + next.x - 2 * curr.x);
      const smoothedY = curr.y + options.smoothingFactor * (prev.y + next.y - 2 * curr.y);
      smoothed.push({ x: smoothedX, y: smoothedY, timestamp: curr.timestamp });
    }
    smoothed.push(points[points.length - 1]);
    return smoothed;
  }, [options.smoothingFactor]);

  const getObjectCoverage = useCallback((object: any, polygon: LassoPoint[]): number => {
    if (polygon.length < 3) return 0;
    const objData = object.data;
    const objBounds = {
      x1: objData.x,
      y1: objData.y,
      x2: objData.x + (objData.width || objData.radius * 2 || 50),
      y2: objData.y + (objData.height || objData.radius * 2 || 50),
    };
    const gridSize = 5;
    const totalPoints = gridSize * gridSize;
    let pointsInside = 0;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const testPoint = {
          x: objBounds.x1 + (objBounds.x2 - objBounds.x1) * (i / (gridSize - 1)),
          y: objBounds.y1 + (objBounds.y2 - objBounds.y1) * (j / (gridSize - 1)),
          timestamp: Date.now(),
        };
        if (isPointInPolygon(testPoint, polygon)) {
          pointsInside++;
        }
      }
    }
    return pointsInside / totalPoints;
  }, [isPointInPolygon]);

  const getStagePoint = useCallback((clientX: number, clientY: number): LassoPoint | null => {
    if (!stageRef.current) return null;
    const stage = stageRef.current;
    const stageBox = stage.container().getBoundingClientRect();
    const stageScale = stage.scaleX();
    const stagePos = stage.position();
    return {
      x: (clientX - stageBox.left - stagePos.x) / stageScale,
      y: (clientY - stageBox.top - stagePos.y) / stageScale,
      timestamp: Date.now(),
    };
  }, [stageRef]);

  const shouldAutoClose = useCallback((currentPoint: LassoPoint, startPoint: LassoPoint): boolean => {
    if (!startPoint || lassoPoints.length < 10) return false;
    const distance = getDistance(currentPoint, startPoint);
    return distance < options.autoCloseDistance;
  }, [lassoPoints.length, getDistance, options.autoCloseDistance]);

  const updateSelectionPreview = useCallback((points: LassoPoint[]) => {
    if (points.length < 3) {
      setPreviewSelection([]);
      return;
    }
    const previewIds: string[] = [];
    stageObjects.forEach(obj => {
      if (getObjectCoverage(obj, points) >= options.selectionSensitivity) {
        previewIds.push(obj.id);
      }
    });
    setPreviewSelection(previewIds);
  }, [stageObjects, getObjectCoverage, options.selectionSensitivity]);
  
  
  const clearLassoSelection = useCallback(() => {
    setLockedSelection([]);
    setPreviewSelection([]);
  }, []);

  const toggleLassoMode = useCallback(() => {
    setIsLassoMode(prev => {
      const newMode = !prev;
      if (!newMode) {
        setIsDrawing(false);
        setLassoPoints([]);
        setSmoothedPoints([]);
        setPreviewSelection([]);
        setLockedSelection([]);
        setIsDraggingGroup(false);
        updateSelection([]);
        console.log('🎯 Lasso mode OFF');
      } else {
        console.log('🎯 Lasso mode ON');
      }
      return newMode;
    });
  }, [updateSelection]);

  const isClickOnSelectedObject = useCallback((clientX: number, clientY: number): boolean => {
    if (lockedSelection.length === 0) return false;
    const stagePoint = getStagePoint(clientX, clientY);
    if (!stagePoint) return false;
    for (const objId of lockedSelection) {
      const obj = stageObjects.find(o => o.id === objId);
      if (!obj) continue;
      const objData = obj.data;
      const bounds = {
        x1: objData.x,
        y1: objData.y,
        x2: objData.x + (objData.width || objData.radius * 2 || 50),
        y2: objData.y + (objData.height || objData.radius * 2 || 50),
      };
      if (stagePoint.x >= bounds.x1 && stagePoint.x <= bounds.x2 &&
          stagePoint.y >= bounds.y1 && stagePoint.y <= bounds.y2) {
        return true;
      }
    }
    return false;
  }, [lockedSelection, getStagePoint, stageObjects]);

  const startLasso = useCallback((clientX: number, clientY: number, isTouch = false) => {
    if (!isLassoMode) return;
    if (isClickOnSelectedObject(clientX, clientY)) {
      console.log('🔒 Clicked on selected object, starting group drag');
      setIsDraggingGroup(true);
      return;
    }
    const point = getStagePoint(clientX, clientY);
    if (!point) return;
    console.log(`🎨 Lasso drawing started (${isTouch ? 'touch' : 'mouse'})`);
    setIsDrawing(true);
    setLassoPoints([point]);
    setSmoothedPoints([point]);
    setPreviewSelection([]);
    drawingStateRef.current = {
      lastPoint: point,
      startTime: point.timestamp,
      totalDistance: 0,
      velocity: 0,
      isTouch,
    };
  }, [isLassoMode, getStagePoint, isClickOnSelectedObject]);

  const updateLasso = useCallback((clientX: number, clientY: number) => {
    if (!isDrawing || !isLassoMode || isDraggingGroup) return;

    const point = getStagePoint(clientX, clientY);
    if (!point) return;

    const lastPoint = drawingStateRef.current.lastPoint;
    if (!lastPoint) return;

    const distance = getDistance(lastPoint, point);
    const timeDelta = point.timestamp - lastPoint.timestamp;
    const velocity = timeDelta > 0 ? distance / timeDelta : 0;
    const adaptiveMinDistance = options.minDistance * (1 + velocity * 0.01);

    if (distance >= adaptiveMinDistance) {
      setLassoPoints(prev => {
        if (prev.length > 0 && shouldAutoClose(point, prev[0])) {
          console.log('🔄 Auto-closing lasso');
          setIsAutoClosing(true);
          return [...prev, point, prev[0]];
        }
        return [...prev, point];
      });
      drawingStateRef.current.lastPoint = point;
      drawingStateRef.current.totalDistance += distance;
      drawingStateRef.current.velocity = velocity;
    }
  }, [isDrawing, isLassoMode, isDraggingGroup, getStagePoint, getDistance, options.minDistance, shouldAutoClose]);

  const completeLasso = useCallback(() => {
    if (!isLassoMode || (!isDrawing && !isDraggingGroup)) return;

    if (isDraggingGroup) {
      setIsDraggingGroup(false);
      return;
    }

    console.log('✅ Completing lasso selection');
    setIsDrawing(false);

    const finalPoints = smoothedPoints.length >= 3 ? smoothedPoints : lassoPoints;
    if (finalPoints.length >= 3) {
      const selectedIds = stageObjects
        .filter(obj => getObjectCoverage(obj, finalPoints) >= options.selectionSensitivity)
        .map(obj => obj.id);

      console.log(`🎯 Lasso selected ${selectedIds.length} objects`);
      setLockedSelection(selectedIds);
      updateSelection(selectedIds);

      if (drawingStateRef.current.isTouch && 'vibrate' in navigator && selectedIds.length > 0) {
        navigator.vibrate([50, 30, 50]);
      }
    }

    setTimeout(() => {
      setLassoPoints([]);
      setSmoothedPoints([]);
      setPreviewSelection([]);
      drawingStateRef.current = { lastPoint: null, startTime: 0, totalDistance: 0, velocity: 0, isTouch: false };
    }, 200);
  }, [isLassoMode, isDrawing, isDraggingGroup, smoothedPoints, lassoPoints, stageObjects, getObjectCoverage, options.selectionSensitivity, updateSelection]);

  const cancelLasso = useCallback(() => {
    console.log('❌ Cancelling lasso selection');
    setIsDrawing(false);
    setIsDraggingGroup(false);
    setLassoPoints([]);
    setSmoothedPoints([]);
    setPreviewSelection([]);
    drawingStateRef.current = { lastPoint: null, startTime: 0, totalDistance: 0, velocity: 0, isTouch: false };
  }, []);

  // EFFECT HOOKS

  useEffect(() => {
    if (isAutoClosing) {
      completeLasso();
      setIsAutoClosing(false);
    }
  }, [isAutoClosing, completeLasso]);
  
  useEffect(() => {
    if (lassoPoints.length > 2) {
      const smoothed = smoothPoints(lassoPoints);
      setSmoothedPoints(smoothed);
      updateSelectionPreview(smoothed);
    }
  }, [lassoPoints, smoothPoints, updateSelectionPreview]);
  
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
        const touch = 'touches' in e ? e.touches[0] : null;
        const clientX = 'clientX' in e ? e.clientX : touch?.clientX;
        const clientY = 'clientY' in e ? e.clientY : touch?.clientY;
        if (typeof clientX === 'number' && typeof clientY === 'number') {
            updateLasso(clientX, clientY);
        }
    };
    const handleUp = () => {
        completeLasso();
    };

    if (isDrawing || isDraggingGroup) {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }
  }, [isDrawing, isDraggingGroup, updateLasso, completeLasso]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDrawing || isDraggingGroup) cancelLasso();
        else if (isLassoMode) toggleLassoMode();
      }
      if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleLassoMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, isDraggingGroup, isLassoMode, cancelLasso, toggleLassoMode]);

  return {
    // State
    isLassoMode,
    isDrawing,
    isDraggingGroup,
    lassoPoints,
    smoothedPoints,
    previewSelection,
    lockedSelection,
    isTouchDevice,
    
    // Core actions
    toggleLassoMode,
    startLasso,
    updateLasso,
    completeLasso,
    cancelLasso,
    clearLassoSelection,
    
    isClickOnSelectedObject,
    
    // Stats
    stats: {
      totalDistance: drawingStateRef.current.totalDistance,
      velocity: drawingStateRef.current.velocity,
      pointCount: lassoPoints.length,
      isTouch: drawingStateRef.current.isTouch,
    },
  };
};