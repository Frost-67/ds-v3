import { useCallback, useMemo, useRef } from 'react';
import Konva from 'konva';
import { StageObject } from '~/types/stage-object'; // Assuming this type definition exists
import { DEFAULT_SNAP_CONFIG, SnapConfig } from '~/consts/snap-config';
// import { SnapConfig, DEFAULT_SNAP_CONFIG } from './snap-config'; // Assuming config is in this file

// --- Internal Types ---

interface SnapGuide {
  id: string;
  type: 'object-edge' | 'object-center' | 'spacing' | 'canvas-center';
  orientation: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  color: string;
}

interface ObjectBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// --- Hook Props ---

interface UseVisualSnapGuidesProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  objects: StageObject[];
  canvasBounds: { width: number; height: number; x: number; y: number };
  /**
   * Optional configuration to override the default snap settings.
   * Any properties provided here will be merged with DEFAULT_SNAP_CONFIG.
   */
  config?: Partial<SnapConfig>;
}

/**
 * A React hook to display visual snap guides in a Konva.js stage.
 * This hook ONLY provides visual feedback and does not move the objects.
 * It uses a centralized SnapConfig for all settings and defaults.
 */
export const useVisualSnapGuides = ({
  stageRef,
  objects,
  canvasBounds,
  config: userConfig, // Rename for clarity
}: UseVisualSnapGuidesProps) => {
  const guideLayerRef = useRef<Konva.Layer | null>(null);

  // Merge user-provided config with the main default config to create the final settings.
  const config = useMemo(
    () => ({
      ...DEFAULT_SNAP_CONFIG,
      ...userConfig,
      // Ensure the 'guideColors' object is also merged, not just replaced.
      guideColors: {
        ...DEFAULT_SNAP_CONFIG.guideColors,
        ...userConfig?.guideColors,
      },
    }),
    [userConfig]
  );

  // All settings are now destructured from the final, merged config object.
  const {
    tolerance,
    guideColors,
    lineWidth,
    dashPattern,
    opacity,
    maxGuides,
    showSpacingGuides,
    showCenterGuides,
  } = config;

  // Convert stage objects to simple bounds for efficient calculations
  const objectBounds = useMemo(() => {
    return objects.map((obj) => ({
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

  // Get or create the dedicated layer for drawing guides
  const getGuideLayer = useCallback(() => {
    if (!stageRef.current) return null;

    if (!guideLayerRef.current) {
      guideLayerRef.current = new Konva.Layer({
        name: 'visual-snap-guides',
        listening: false, // This layer should not capture events
      });
      stageRef.current.add(guideLayerRef.current);
    }
    return guideLayerRef.current;
  }, [stageRef]);

  // Clear all guides from the guide layer
  const clearGuides = useCallback(() => {
    const guideLayer = getGuideLayer();
    if (guideLayer) {
      guideLayer.destroyChildren(); // More efficient than find().forEach()
      guideLayer.batchDraw();
    }
  }, [getGuideLayer]);

  // Calculate which guides to show for a dragging object
  const calculateGuides = useCallback(
    (
      draggingObjectId: string,
      currentPos: { x: number; y: number },
      objectSize: { width: number; height: number }
    ): SnapGuide[] => {
      const guides: SnapGuide[] = [];

      // Current object's bounds being dragged
      const current: Omit<ObjectBounds, 'id'> = {
        left: currentPos.x,
        right: currentPos.x + objectSize.width,
        top: currentPos.y,
        bottom: currentPos.y + objectSize.height,
        centerX: currentPos.x + objectSize.width / 2,
        centerY: currentPos.y + objectSize.height / 2,
        width: objectSize.width,
        height: objectSize.height,
      };

      // Other objects (excluding the one being dragged)
      const others = objectBounds.filter((obj) => obj.id !== draggingObjectId);

      // 1. OBJECT ALIGNMENT GUIDES (edges and centers)
      others.forEach((other) => {
        const guideStartOffset = 20;
        const startY = Math.min(current.top, other.top) - guideStartOffset;
        const endY = Math.max(current.bottom, other.bottom) + guideStartOffset;
        const startX = Math.min(current.left, other.left) - guideStartOffset;
        const endX = Math.max(current.right, other.right) + guideStartOffset;

        // Vertical alignment
        if (Math.abs(current.left - other.left) <= tolerance) guides.push({ id: `align-left-${other.id}`, type: 'object-edge', orientation: 'vertical', position: other.left, start: startY, end: endY, color: guideColors.objectEdge });
        if (Math.abs(current.right - other.right) <= tolerance) guides.push({ id: `align-right-${other.id}`, type: 'object-edge', orientation: 'vertical', position: other.right, start: startY, end: endY, color: guideColors.objectEdge });
        if (showCenterGuides && Math.abs(current.centerX - other.centerX) <= tolerance) guides.push({ id: `align-center-x-${other.id}`, type: 'object-center', orientation: 'vertical', position: other.centerX, start: startY, end: endY, color: guideColors.objectCenter });

        // Horizontal alignment
        if (Math.abs(current.top - other.top) <= tolerance) guides.push({ id: `align-top-${other.id}`, type: 'object-edge', orientation: 'horizontal', position: other.top, start: startX, end: endX, color: guideColors.objectEdge });
        if (Math.abs(current.bottom - other.bottom) <= tolerance) guides.push({ id: `align-bottom-${other.id}`, type: 'object-edge', orientation: 'horizontal', position: other.bottom, start: startX, end: endX, color: guideColors.objectEdge });
        if (showCenterGuides && Math.abs(current.centerY - other.centerY) <= tolerance) guides.push({ id: `align-center-y-${other.id}`, type: 'object-center', orientation: 'horizontal', position: other.centerY, start: startX, end: endX, color: guideColors.objectCenter });
      });

      // 2. SMART SPACING GUIDES (controlled by config)
      if (showSpacingGuides) {
        others.forEach((obj1, i) => {
          others.slice(i + 1).forEach((obj2) => {
            // Check horizontal spacing
            if (areHorizontallyAligned(obj1, obj2, tolerance)) {
              const spacing = Math.abs((obj1.left < obj2.left ? obj2.left - obj1.right : obj1.left - obj2.right));
              const leftTarget = Math.min(obj1.right, obj2.right) + spacing;
              const rightTarget = Math.max(obj1.left, obj2.left) - spacing - current.width;
              const startY = Math.min(current.top, obj1.top, obj2.top) - 10;
              const endY = Math.max(current.bottom, obj1.bottom, obj2.bottom) + 10;
              if (Math.abs(current.left - leftTarget) <= tolerance) guides.push({ id: `spacing-h-${obj1.id}-${obj2.id}`, type: 'spacing', orientation: 'vertical', position: leftTarget, start: startY, end: endY, color: guideColors.spacing });
              if (Math.abs(current.left - rightTarget) <= tolerance) guides.push({ id: `spacing-h-${obj1.id}-${obj2.id}`, type: 'spacing', orientation: 'vertical', position: rightTarget, start: startY, end: endY, color: guideColors.spacing });
            }
            // Check vertical spacing
            if (areVerticallyAligned(obj1, obj2, tolerance)) {
                const spacing = Math.abs((obj1.top < obj2.top ? obj2.top - obj1.bottom : obj1.top - obj2.bottom));
                const topTarget = Math.min(obj1.bottom, obj2.bottom) + spacing;
                const bottomTarget = Math.max(obj1.top, obj2.top) - spacing - current.height;
                const startX = Math.min(current.left, obj1.left, obj2.left) - 10;
                const endX = Math.max(current.right, obj1.right, obj2.right) + 10;
                if (Math.abs(current.top - topTarget) <= tolerance) guides.push({ id: `spacing-v-${obj1.id}-${obj2.id}`, type: 'spacing', orientation: 'horizontal', position: topTarget, start: startX, end: endX, color: guideColors.spacing });
                if (Math.abs(current.top - bottomTarget) <= tolerance) guides.push({ id: `spacing-v-${obj1.id}-${obj2.id}`, type: 'spacing', orientation: 'horizontal', position: bottomTarget, start: startX, end: endX, color: guideColors.spacing });
            }
          });
        });
      }

      // 3. CANVAS CENTER GUIDES (controlled by config)
      if (showCenterGuides) {
        const canvasCenterX = canvasBounds.x + canvasBounds.width / 2;
        const canvasCenterY = canvasBounds.y + canvasBounds.height / 2;
        if (Math.abs(current.centerX - canvasCenterX) <= tolerance) guides.push({ id: 'canvas-center-x', type: 'canvas-center', orientation: 'vertical', position: canvasCenterX, start: canvasBounds.y, end: canvasBounds.y + canvasBounds.height, color: guideColors.canvasCenter });
        if (Math.abs(current.centerY - canvasCenterY) <= tolerance) guides.push({ id: 'canvas-center-y', type: 'canvas-center', orientation: 'horizontal', position: canvasCenterY, start: canvasBounds.x, end: canvasBounds.x + canvasBounds.width, color: guideColors.canvasCenter });
      }

      return guides;
    },
    [objectBounds, canvasBounds, tolerance, guideColors, showCenterGuides, showSpacingGuides]
  );

  // Draw the calculated guides on the guide layer
  const drawGuides = useCallback(
    (guides: SnapGuide[]) => {
      const guideLayer = getGuideLayer();
      if (!guideLayer) return;

      clearGuides();

      // Limit guides to prevent clutter and improve performance
      const limitedGuides = guides.slice(0, maxGuides);

      limitedGuides.forEach((guide) => {
        const line = new Konva.Line({
          points: guide.orientation === 'horizontal' ? [guide.start, guide.position, guide.end, guide.position] : [guide.position, guide.start, guide.position, guide.end],
          stroke: guide.color,
          strokeWidth: lineWidth,
          name: 'snap-guide', // Use a name for easy selection
          dash: dashPattern,
          opacity,
          listening: false,
          perfectDrawEnabled: false, // Better performance for simple lines
        });
        guideLayer.add(line);
      });

      guideLayer.batchDraw();
    },
    [getGuideLayer, clearGuides, lineWidth, dashPattern, opacity, maxGuides]
  );

  // Main function to call during a drag event to show guides
  const showGuidesForDrag = useCallback(
    (draggingObjectId: string, currentPos: { x: number; y: number }, objectSize: { width: number; height: number }) => {
      const guides = calculateGuides(draggingObjectId, currentPos, objectSize);
      drawGuides(guides);
    },
    [calculateGuides, drawGuides]
  );

  return {
    showGuidesForDrag,
    clearGuides,
  };
};

// --- Helper Functions ---

/** Checks if two objects overlap vertically, suggesting they are horizontally aligned. */
function areHorizontallyAligned(obj1: ObjectBounds, obj2: ObjectBounds, tolerance: number): boolean {
  return !(obj1.bottom < obj2.top - tolerance || obj2.bottom < obj1.top - tolerance);
}

/** Checks if two objects overlap horizontally, suggesting they are vertically aligned. */
function areVerticallyAligned(obj1: ObjectBounds, obj2: ObjectBounds, tolerance: number): boolean {
  return !(obj1.right < obj2.left - tolerance || obj2.right < obj1.left - tolerance);
}