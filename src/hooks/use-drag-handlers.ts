import { useCallback, useRef } from 'react';
import Konva from 'konva';
import { StageObject } from '~/types/stage-object';
import useKeyPress from './use-key-press';
import { KeyType } from '~/consts/keys';
import { useCanvasContexts } from './use-canvas-contexts';
import { useDragContext } from './use-drag-context';
import { useVisualSnapGuides } from './use-visual-snap-guides';
import { GRID_AND_SNAP_SETTINGS } from '~/consts/ui';

const useDragHandlers = (stageRef?: React.RefObject<Konva.Stage | null>) => {
  const {
    updateObject,
    saveToHistory,
    objects,
    gridSettings,
    getCurrentCanvasBounds
  } = useCanvasContexts();

  const { startDrag, updateDragPosition, endDrag } = useDragContext();
  const isDragStagePressed = useKeyPress(KeyType.DRAG_STAGE);

  // Get canvas bounds
  const canvasBounds = getCurrentCanvasBounds();

  // Initialize VISUAL-ONLY snap guides
  const { showGuidesForDrag, clearGuides } = useVisualSnapGuides({
    stageRef: stageRef || { current: null },
    objects,
    canvasBounds,
    gridSize: gridSettings?.gridSize || GRID_AND_SNAP_SETTINGS.gridSize,
    tolerance: gridSettings?.snapTolerance || GRID_AND_SNAP_SETTINGS.snapTolerance,
    showGrid: gridSettings?.showGrid || GRID_AND_SNAP_SETTINGS.showGrid,
  });

  const dragStateRef = useRef({
    startPosition: { x: 0, y: 0 },
  });

  // Clean up drag state
  const cleanupDragState = useCallback(() => {
    endDrag();
    clearGuides(); // Clear visual guides
    document.body.style.cursor = '';
  }, [endDrag, clearGuides]);

  const onDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;
    const objectId = target.attrs.id;

    if (isDragStagePressed) {
      target.stopDrag();
      return;
    }

    saveToHistory();

    const startPos = { x: target.x(), y: target.y() };
    dragStateRef.current.startPosition = startPos;

    // Initialize drag context
    startDrag(objectId, startPos);

    document.body.style.cursor = 'grabbing';
  }, [isDragStagePressed, saveToHistory, startDrag]);

  // Drag move - ONLY show visual guides
  const onDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;
    const objectId = target.attrs.id;

    if (isDragStagePressed) {
      return;
    }
    const currentPos = {
      x: target.x(),
      y: target.y()
    };

    const objectSize = {
      width: target.width() * (target.scaleX() || 1),
      height: target.height() * (target.scaleY() || 1)
    };

    // ONLY show visual guides
    showGuidesForDrag(objectId, currentPos, objectSize);

    // Update drag context for other components
    updateDragPosition(currentPos);

  }, [isDragStagePressed, showGuidesForDrag, updateDragPosition]);

  // Simple drag end - just update object position and clear guides
  const onDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, obj: StageObject) => {
    const target = e.target;
    const objectId = obj.id;

    // Get final position (wherever the user dropped it)
    const finalPosition = { x: target.x(), y: target.y() };

    // Update object in context with final position
    updateObject(objectId, {
      x: finalPosition.x,
      y: finalPosition.y,
      updatedAt: Date.now(),
    });
    // Clean up
    cleanupDragState();

    return finalPosition;
  }, [updateObject, cleanupDragState]);

  return {
    onDragStart,
    onDragMove,
    onDragEnd,
    cleanupDragState,
  };
};

export default useDragHandlers;