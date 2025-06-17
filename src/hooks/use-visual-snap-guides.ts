import { useCallback, useRef, useMemo } from 'react';
import Konva from 'konva';
import { StageObject } from '~/types/stage-object';

interface SnapGuide {
  id: string;
  type: 'grid' | 'object-edge' | 'object-center' | 'spacing';
  orientation: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  color: string;
}

interface UseVisualSnapGuidesProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  objects: StageObject[];
  canvasBounds: { width: number; height: number; x: number; y: number };
  gridSize?: number;
  tolerance?: number;
  showGrid?: boolean;
  
  // CUSTOMIZABLE COLORS & APPEARANCE
  colors?: {
    objectEdge?: string;     // Pink lines - Object edge alignment
    objectCenter?: string;   // Green lines - Center alignment  
    spacing?: string;        // Orange lines - Equal spacing
    canvasCenter?: string;   // Blue lines - Canvas center
    grid?: string;          // Gray lines - Grid alignment
  };
  lineWidth?: number;
  dashPattern?: number[];
  opacity?: number;
  maxGuides?: number;
}

export const useVisualSnapGuides = ({
  stageRef,
  objects,
  canvasBounds,
  gridSize = 20,
  tolerance = 8,
  showGrid = true,
  
  // EASY COLOR CUSTOMIZATION - Change these to customize guide colors!
  colors = {
    objectEdge: '#FF6B9D',    // Pink lines - Object edge alignment
    objectCenter: '#10B981',  // Green lines - Center alignment
    spacing: '#F59E0B',       // Orange lines - Equal spacing  
    canvasCenter: '#3B82F6',  // Blue lines - Canvas center
    grid: '#94a3b8',         // Gray lines - Grid alignment
  },
  lineWidth = 3,             // Guide line thickness
  dashPattern = [4, 6],      // Dash pattern [line, gap]
  opacity = 1,             // Guide opacity (0-1)
  maxGuides = 4,             // Max guides to prevent clutter
}: UseVisualSnapGuidesProps) => {
  
  const guideLayerRef = useRef<Konva.Layer | null>(null);

  // Convert objects to simple bounds for calculations
  const objectBounds = useMemo(() => {
    return objects.map(obj => ({
      id: obj.id,
      left: obj.data.x,
      right: obj.data.x + obj.data.width,
      top: obj.data.y,
      bottom: obj.data.y + obj.data.height,
      centerX: obj.data.x + obj.data.width / 2,
      centerY: obj.data.y + obj.data.height / 2,
      width: obj.data.width,
      height: obj.data.height,
    }));
  }, [objects]);

  // Get or create guide layer
  const getGuideLayer = useCallback(() => {
    if (!stageRef.current) return null;
    
    if (!guideLayerRef.current) {
      guideLayerRef.current = new Konva.Layer({ 
        name: 'visual-snap-guides',
        listening: false 
      });
      stageRef.current.add(guideLayerRef.current);
    }
    return guideLayerRef.current;
  }, [stageRef]);

  // Clear all guides
  const clearGuides = useCallback(() => {
    const guideLayer = getGuideLayer();
    if (!guideLayer) return;

    guideLayer.find('.snap-guide').forEach(line => line.destroy());
    guideLayer.batchDraw();
  }, [getGuideLayer]);

  // Calculate which guides to show for a dragging object
  const calculateGuides = useCallback((
    draggingObjectId: string,
    currentPos: { x: number; y: number },
    objectSize: { width: number; height: number }
  ): SnapGuide[] => {
    const guides: SnapGuide[] = [];
    
    // Current object bounds
    const current = {
      left: currentPos.x,
      right: currentPos.x + objectSize.width,
      top: currentPos.y,
      bottom: currentPos.y + objectSize.height,
      centerX: currentPos.x + objectSize.width / 2,
      centerY: currentPos.y + objectSize.height / 2,
    };

    // Other objects (excluding the one being dragged)
    const others = objectBounds.filter(obj => obj.id !== draggingObjectId);

    // Update all color references to use the customizable colors
    others.forEach(other => {
      // Vertical alignment guides
      if (Math.abs(current.left - other.left) <= tolerance) {
        guides.push({
          id: `align-left-${other.id}`,
          type: 'object-edge',
          orientation: 'vertical',
          position: other.left,
          start: Math.min(current.top, other.top) - 20,
          end: Math.max(current.bottom, other.bottom) + 20,
          color: colors.objectEdge!, // Pink - Object edge alignment
        });
      }
      
      if (Math.abs(current.right - other.right) <= tolerance) {
        guides.push({
          id: `align-right-${other.id}`,
          type: 'object-edge',
          orientation: 'vertical',
          position: other.right,
          start: Math.min(current.top, other.top) - 20,
          end: Math.max(current.bottom, other.bottom) + 20,
          color: colors.objectEdge!, // Pink - Object edge alignment
        });
      }
      
      if (Math.abs(current.centerX - other.centerX) <= tolerance) {
        guides.push({
          id: `align-center-x-${other.id}`,
          type: 'object-center',
          orientation: 'vertical',
          position: other.centerX,
          start: Math.min(current.top, other.top) - 20,
          end: Math.max(current.bottom, other.bottom) + 20,
          color: colors.objectCenter!, // Green - Center alignment
        });
      }

      // Horizontal alignment guides
      if (Math.abs(current.top - other.top) <= tolerance) {
        guides.push({
          id: `align-top-${other.id}`,
          type: 'object-edge',
          orientation: 'horizontal',
          position: other.top,
          start: Math.min(current.left, other.left) - 20,
          end: Math.max(current.right, other.right) + 20,
          color: colors.objectEdge!, // Pink - Object edge alignment
        });
      }
      
      if (Math.abs(current.bottom - other.bottom) <= tolerance) {
        guides.push({
          id: `align-bottom-${other.id}`,
          type: 'object-edge',
          orientation: 'horizontal',
          position: other.bottom,
          start: Math.min(current.left, other.left) - 20,
          end: Math.max(current.right, other.right) + 20,
          color: colors.objectEdge!, // Pink - Object edge alignment
        });
      }
      
      if (Math.abs(current.centerY - other.centerY) <= tolerance) {
        guides.push({
          id: `align-center-y-${other.id}`,
          type: 'object-center',
          orientation: 'horizontal',
          position: other.centerY,
          start: Math.min(current.left, other.left) - 20,
          end: Math.max(current.right, other.right) + 20,
          color: colors.objectCenter!, // Green - Center alignment
        });
      }
    });

    // 2. SMART SPACING GUIDES (equal gaps between objects)
    others.forEach((obj1, i) => {
      others.slice(i + 1).forEach(obj2 => {
        // Check for horizontal spacing patterns
        if (areHorizontallyAligned(obj1, obj2, tolerance)) {
          const spacing = obj1.left < obj2.left ? obj2.left - obj1.right : obj1.left - obj2.right;
          
          // Check if current object would create equal spacing
          const leftTarget = Math.min(obj1.left, obj2.left) - spacing - current.right + current.left;
          const rightTarget = Math.max(obj1.right, obj2.right) + spacing;
          
          if (Math.abs(current.left - leftTarget) <= tolerance) {
            guides.push({
              id: `spacing-left-${obj1.id}-${obj2.id}`,
              type: 'spacing',
              orientation: 'vertical',
              position: leftTarget,
              start: Math.min(obj1.top, obj2.top, current.top) - 10,
              end: Math.max(obj1.bottom, obj2.bottom, current.bottom) + 10,
              color: colors.spacing!, // Orange - Equal spacing
            });
          }
          
          if (Math.abs(current.left - rightTarget) <= tolerance) {
            guides.push({
              id: `spacing-right-${obj1.id}-${obj2.id}`,
              type: 'spacing',
              orientation: 'vertical',
              position: rightTarget,
              start: Math.min(obj1.top, obj2.top, current.top) - 10,
              end: Math.max(obj1.bottom, obj2.bottom, current.bottom) + 10,
              color: colors.spacing!, // Orange - Equal spacing
            });
          }
        }
        
        // Similar logic for vertical spacing...
        if (areVerticallyAligned(obj1, obj2, tolerance)) {
          const spacing = obj1.top < obj2.top ? obj2.top - obj1.bottom : obj1.top - obj2.bottom;
          
          const topTarget = Math.min(obj1.top, obj2.top) - spacing - current.bottom + current.top;
          const bottomTarget = Math.max(obj1.bottom, obj2.bottom) + spacing;
          
          if (Math.abs(current.top - topTarget) <= tolerance) {
            guides.push({
              id: `spacing-top-${obj1.id}-${obj2.id}`,
              type: 'spacing',
              orientation: 'horizontal',
              position: topTarget,
              start: Math.min(obj1.left, obj2.left, current.left) - 10,
              end: Math.max(obj1.right, obj2.right, current.right) + 10,
              color: colors.spacing!, // Orange - Equal spacing
            });
          }
          
          if (Math.abs(current.top - bottomTarget) <= tolerance) {
            guides.push({
              id: `spacing-bottom-${obj1.id}-${obj2.id}`,
              type: 'spacing',
              orientation: 'horizontal',
              position: bottomTarget,
              start: Math.min(obj1.left, obj2.left, current.left) - 10,
              end: Math.max(obj1.right, obj2.right, current.right) + 10,
              color: colors.spacing!, // Orange - Equal spacing
            });
          }
        }
      });
    });

    // 3. CANVAS CENTER GUIDES
    const canvasCenterX = canvasBounds.x + canvasBounds.width / 2;
    const canvasCenterY = canvasBounds.y + canvasBounds.height / 2;
    
    if (Math.abs(current.centerX - canvasCenterX) <= tolerance) {
      guides.push({
        id: 'canvas-center-x',
        type: 'object-center',
        orientation: 'vertical',
        position: canvasCenterX,
        start: canvasBounds.y,
        end: canvasBounds.y + canvasBounds.height,
        color: colors.canvasCenter!, // Blue - Canvas center
      });
    }
    
    if (Math.abs(current.centerY - canvasCenterY) <= tolerance) {
      guides.push({
        id: 'canvas-center-y',
        type: 'object-center',
        orientation: 'horizontal',
        position: canvasCenterY,
        start: canvasBounds.x,
        end: canvasBounds.x + canvasBounds.width,
        color: colors.canvasCenter!, // Blue - Canvas center
      });
    }

    // 4. GRID GUIDES (only if close to grid lines)
    if (showGrid) {
      // Check grid snapping for object edges and center
      const gridPositions = [
        { pos: current.left, type: 'left' },
        { pos: current.right, type: 'right' },
        { pos: current.centerX, type: 'center-x' },
      ];
      
      gridPositions.forEach(({ pos, type }) => {
        const nearestGrid = Math.round(pos / gridSize) * gridSize;
        if (Math.abs(pos - nearestGrid) <= tolerance) {
          guides.push({
            id: `grid-x-${type}`,
            type: 'grid',
            orientation: 'vertical',
            position: nearestGrid,
            start: canvasBounds.y,
            end: canvasBounds.y + canvasBounds.height,
            color: colors.grid!, // Gray - Grid alignment
          });
        }
      });
      
      const gridPositionsY = [
        { pos: current.top, type: 'top' },
        { pos: current.bottom, type: 'bottom' },
        { pos: current.centerY, type: 'center-y' },
      ];
      
      gridPositionsY.forEach(({ pos, type }) => {
        const nearestGrid = Math.round(pos / gridSize) * gridSize;
        if (Math.abs(pos - nearestGrid) <= tolerance) {
          guides.push({
            id: `grid-y-${type}`,
            type: 'grid',
            orientation: 'horizontal',
            position: nearestGrid,
            start: canvasBounds.x,
            end: canvasBounds.x + canvasBounds.width,
            color: colors.grid!, // Gray - Grid alignment
          });
        }
      });
    }

    return guides;
  }, [objectBounds, canvasBounds, tolerance, gridSize, showGrid]);

  // Draw the guides (VISUAL ONLY)
  const drawGuides = useCallback((guides: SnapGuide[]) => {
    const guideLayer = getGuideLayer();
    if (!guideLayer) return;

    // Clear existing guides
    clearGuides();

    // Limit guides to prevent clutter and improve performance
    const limitedGuides = guides.slice(0, maxGuides);

    limitedGuides.forEach((guide) => {
      let line: Konva.Line;
      
      if (guide.orientation === 'horizontal') {
        line = new Konva.Line({
          points: [guide.start, guide.position, guide.end, guide.position],
          stroke: guide.color,
          strokeWidth: lineWidth,           // Customizable line width
          name: 'snap-guide',
          dash: dashPattern,               // Customizable dash pattern
          opacity: opacity,                // Customizable opacity
          listening: false,
          perfectDrawEnabled: false,
        });
      } else {
        line = new Konva.Line({
          points: [guide.position, guide.start, guide.position, guide.end],
          stroke: guide.color,
          strokeWidth: lineWidth,           // Customizable line width
          name: 'snap-guide',
          dash: dashPattern,               // Customizable dash pattern
          opacity: opacity,                // Customizable opacity
          listening: false,
          perfectDrawEnabled: false,
        });
      }

      guideLayer.add(line);
    });

    guideLayer.batchDraw();
  }, [getGuideLayer, clearGuides]);

  // Main function to show guides during drag (NO OBJECT MOVEMENT)
  const showGuidesForDrag = useCallback((
    draggingObjectId: string,
    currentPos: { x: number; y: number },
    objectSize: { width: number; height: number }
  ) => {
    const guides = calculateGuides(draggingObjectId, currentPos, objectSize);
    drawGuides(guides);
  }, [calculateGuides, drawGuides]);

  return {
    showGuidesForDrag,
    clearGuides,
    // No object movement functions - purely visual!
  };
};

// Helper functions
function areHorizontallyAligned(obj1: any, obj2: any, tolerance: number): boolean {
  return !(obj1.bottom < obj2.top - tolerance || obj2.bottom < obj1.top - tolerance);
}

function areVerticallyAligned(obj1: any, obj2: any, tolerance: number): boolean {
  return !(obj1.right < obj2.left - tolerance || obj2.right < obj1.left - tolerance);
}