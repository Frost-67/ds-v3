import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import Konva from 'konva';
import { Box } from '@chakra-ui/react';
import { Stage, Layer, Transformer, Group } from 'react-konva';
import TextObject from './objects/TextObject/TextObject';
import { KonvaEventObject } from 'konva/lib/Node';
import ImageObject from './objects/ImageObject/ImageObject';
import ShapeObject, { StageRefContext } from './objects/ShapeObject/ShapeObject'; // Import context
import { StageObject, StageObjectType, StageTextObjectData } from '~/types/stage-object';
import useTransformer from '~/hooks/use-transformer';
import { useAppContext } from '~/context/AppContext';
import { useLassoSelection } from '~/hooks/use-lasso-selection';
import { LassoVisual } from '~/components/LassoSelection';
import LassoTogglePopup from '~/components/LassoSelection/LassoTogglePopup';
import CanvasBounds from '~/components/CanvasBounds/CanvasBounds';
import useStageResizeFixed from '~/hooks/use-stage-resize';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import useDragHandlers from '~/hooks/use-drag-handlers';
import { useTouchZoom } from '~/hooks/use-touch-zoom';
import { useDragContext } from '~/hooks/use-drag-context';
import { GRID_AND_SNAP_SETTINGS } from '~/consts/ui';

type IProps = {
  stageRef?: React.RefObject<Konva.Stage | null> | null;
  isLassoMode?: boolean;
  onToggleLassoMode?: () => void;
};

const Frame = ({ stageRef: propsStageRef, isLassoMode = false, onToggleLassoMode }: IProps) => {
  const internalStageRef = useRef<Konva.Stage | null>(null);
  const stageRef = propsStageRef || internalStageRef;

  console.log('📐 Frame render - stageRef available:', !!stageRef.current);

  const {
    objects: stageObjects,
    selected,
    updateSelection,
    camera,
    updateCamera,
    switchToContext,
    updateObject,
    getCurrentCanvasBounds,
    gridSettings
  } = useCanvasContexts();

  const GridSettings = gridSettings || {
    ...GRID_AND_SNAP_SETTINGS
  };

  const {
    activeUnitId,
    activeElevationId,
    activeView,
    getCurrentView
  } = useAppContext();

  const groupRef = useRef<Konva.Group | null>(null);

  // Touch zoom functionality
  const {
    isZooming,
    handleTouchStart: handleZoomTouchStart,
    handleTouchMove: handleZoomTouchMove,
    handleTouchEnd: handleZoomTouchEnd,
    handleTouchCancel: handleZoomTouchCancel,
  } = useTouchZoom(stageRef as React.RefObject<Konva.Stage>, {
    minScale: 0.1,
    maxScale: 5,
    onZoomChange: (scale) => {
      if (stageRef?.current) {
        const stage = stageRef.current;
        updateCamera({
          x: stage.x(),
          y: stage.y(),
          scale: scale
        });
      }
    }
  });

  // Lasso selection functionality
  const {
    isLassoMode: lassoModeActive,
    isDrawing,
    isDraggingGroup,
    lassoPoints,
    smoothedPoints,
    previewSelection,
    lockedSelection,
    isTouchDevice,
    toggleLassoMode,
    startLasso,
    cancelLasso,
    clearLassoSelection,
    stats,
  } = useLassoSelection(stageRef);

  // Stage resize functionality
  const {
    boxWidth,
    boxHeight,
    handleZoom,
    handleDragMoveStage,
  } = useStageResizeFixed({ stageRef });

  // Sync lasso mode state
  useEffect(() => {
    if (isLassoMode !== lassoModeActive) {
      toggleLassoMode();
    }
  }, [isLassoMode, lassoModeActive, toggleLassoMode]);


  const { cleanupDragState } = useDragHandlers(stageRef);
  const {
    transformers,
    onTransformerEnd,
    onTransformStart
  } = useTransformer({ stageRef });

  const { imageTransformer, textTransformer, multiTransformer } = transformers;

  // Reset object selection
  const resetObjectSelect = useCallback(() => {
    updateSelection([]);
    try {
      imageTransformer?.current?.nodes([]);
      textTransformer?.current?.nodes([]);
      multiTransformer?.current?.nodes([]);
      imageTransformer?.current?.getLayer()?.batchDraw();
      textTransformer?.current?.getLayer()?.batchDraw();
      multiTransformer?.current?.getLayer()?.batchDraw();
    } catch (error) {
      console.warn('Error resetting transformers:', error);
    }
  }, [updateSelection, imageTransformer, textTransformer, multiTransformer]);

  // Handle object selection
  const onObjectSelect = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    if (!target) return;

    if (target.getType() === 'Stage') {
      if (!lassoModeActive) {
        resetObjectSelect();
      }
      return;
    }

    if (lassoModeActive) {
      clearLassoSelection();
    }

    const targetId = target.attrs.id;
    const targetType = target.attrs.type;

    try {
      if (targetType === StageObjectType.IMAGE || targetType === StageObjectType.SHAPE) {
        imageTransformer?.current?.nodes([target]);
        textTransformer?.current?.nodes([]);
        multiTransformer?.current?.nodes([]);
        updateSelection([targetId]);
      } else if (targetType === StageObjectType.TEXT) {
        textTransformer?.current?.nodes([target]);
        imageTransformer?.current?.nodes([]);
        multiTransformer?.current?.nodes([]);
        updateSelection([targetId]);
      }
      imageTransformer?.current?.getLayer()?.batchDraw();
      textTransformer?.current?.getLayer()?.batchDraw();
      multiTransformer?.current?.getLayer()?.batchDraw();
    } catch (error) {
      console.warn('Error during object selection:', error);
    }
  }, [updateSelection, imageTransformer, textTransformer, multiTransformer, lassoModeActive, resetObjectSelect, clearLassoSelection]);

  // Context switching effect
  useEffect(() => {
    if (activeUnitId && activeElevationId) {
      const contextTabId = `${activeUnitId}-${activeElevationId}`;
      switchToContext(contextTabId, activeView);
    }
  }, [activeUnitId, activeElevationId, activeView, switchToContext]);

  // Reset selection when objects change
  useEffect(() => {
    resetObjectSelect();
  }, [stageObjects, resetObjectSelect]);

  // Camera synchronization
  useEffect(() => {
    if (stageRef?.current && camera) {
      const stage = stageRef.current;
      stage.position({ x: camera.x, y: camera.y });
      stage.scale({ x: camera.scale, y: camera.scale });
      stage.batchDraw();
    }
  }, [camera, stageRef]);

  // Stage movement handler
  const handleStageMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (lassoModeActive || isDraggingGroup) {
      e.evt.preventDefault();
      return;
    }
    handleDragMoveStage(e);
    if (stageRef?.current) {
      const stage = stageRef.current;
      updateCamera({
        x: stage.position().x,
        y: stage.position().y,
        scale: stage.scaleX()
      });
    }
  }, [handleDragMoveStage, stageRef, updateCamera, lassoModeActive, isDraggingGroup]);

  // Mouse event handlers
  const handleStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      if (lassoModeActive && !isDrawing && !isDraggingGroup) {
        startLasso(e.evt.clientX, e.evt.clientY, false);
      } else if (!lassoModeActive) {
        resetObjectSelect();
      }
    }
  }, [lassoModeActive, isDrawing, isDraggingGroup, startLasso, resetObjectSelect]);

  // Touch event handlers
  const handleStageTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length >= 2) {
      handleZoomTouchStart(e);
      return;
    }
    if (touches.length === 1) {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty && lassoModeActive && !isDrawing && !isDraggingGroup && !isZooming) {
        startLasso(touches[0].clientX, touches[0].clientY, true);
      } else if (!lassoModeActive && !isZooming) {
        resetObjectSelect();
      }
    }
  }, [handleZoomTouchStart, lassoModeActive, isDrawing, isDraggingGroup, isZooming, startLasso, resetObjectSelect]);

  const handleStageTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length >= 2 && isZooming) {
      handleZoomTouchMove(e);
    }
  }, [handleZoomTouchMove, isZooming]);

  const handleStageTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
    handleZoomTouchEnd(e);
  }, [handleZoomTouchEnd]);

  const handleStageTouchCancel = useCallback(() => {
    handleZoomTouchCancel();
    if (lassoModeActive && (isDrawing || isDraggingGroup)) {
      cancelLasso();
    }
  }, [handleZoomTouchCancel, lassoModeActive, isDrawing, isDraggingGroup, cancelLasso]);

  // Group drag handlers for lasso selection
  const handleGroupDragStart = useCallback(() => {
    console.log('🎯 Starting group drag');
  }, []);

  const handleGroupDragEnd = useCallback(() => {
    console.log('🎯 Group drag ended');
    if (!groupRef.current) return;
    const group = groupRef.current;
    const deltaX = group.x();
    const deltaY = group.y();
    lockedSelection.forEach(objId => {
      const obj = stageObjects.find((o) => o.id === objId);
      if (obj) {
        updateObject(objId, {
          x: obj.data.x + deltaX,
          y: obj.data.y + deltaY,
          updatedAt: Date.now(),
        });
      }
    });
    group.position({ x: 0, y: 0 });
  }, [lockedSelection, stageObjects, updateObject]);

  // Cleanup on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetObjectSelect();
        cleanupDragState();
        if (lassoModeActive && (isDrawing || isDraggingGroup)) {
          cancelLasso();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [resetObjectSelect, cleanupDragState, lassoModeActive, isDrawing, isDraggingGroup, cancelLasso]);

  // Sorted objects for proper z-index rendering
  const sortedStageObjects = useMemo(() => {
    return [...stageObjects].sort((a, b) => a.data.z_index - b.data.z_index || a.data.updatedAt - b.data.updatedAt);
  }, [stageObjects]);

  // Separate locked and other objects for lasso selection
  const { lockedObjects, otherObjects } = useMemo(() => {
    const locked = new Set(lockedSelection);
    const lockedArr: StageObject[] = [];
    const othersArr: StageObject[] = [];
    sortedStageObjects.forEach(obj => {
      if (locked.has(obj.id)) {
        lockedArr.push(obj);
      } else {
        othersArr.push(obj);
      }
    });
    return { lockedObjects: lockedArr, otherObjects: othersArr };
  }, [sortedStageObjects, lockedSelection]);

  // Render stage objects with proper props - PASS STAGEREF
  const renderStageObject = useCallback((obj: StageObject, isInGroup = false) => {
    const data = obj.data;
    const isInPreview = previewSelection.includes(obj.id);
    const isSelected = selected.includes(obj.id);
    const isInLockedSelection = lockedSelection.includes(obj.id);
    const isDraggable = !isInGroup;
    const commonProps = {
      obj: {
        ...obj,
        isInLassoPreview: isInPreview,
        isSelected,
        isLocked: false,
        isInLockedSelection,
        isDraggable,
      },
      onSelect: onObjectSelect,
      stageRef, // PASS STAGEREF TO ALL OBJECTS
    };
    switch (data.type) {
      case StageObjectType.IMAGE:
        return <ImageObject key={obj.id} {...commonProps} />;
      case StageObjectType.TEXT:
        return <TextObject key={obj.id} onSelect={onObjectSelect} shapeProps={obj as StageTextObjectData} />;
      case StageObjectType.SHAPE:
        return <ShapeObject key={obj.id} {...commonProps} />;
      default:
        return null;
    }
  }, [onObjectSelect, previewSelection, selected, lockedSelection, stageRef]);

  // Get current view canvas dimensions
  const currentViewData = getCurrentView();
  const canvasWidth = currentViewData?.canvas.width || 1080;
  const canvasHeight = currentViewData?.canvas.height || 1080;
  const canvasBackgroundColor = currentViewData?.canvas.backgroundColor || 'white';

  // Dynamic cursor based on current state
  const cursorStyle = useMemo(() => {
    if (isZooming) return 'grabbing';
    if (lassoModeActive) {
      if (isDraggingGroup) return 'grabbing';
      if (isDrawing) return 'crosshair';
      return 'crosshair';
    }
    return 'default';
  }, [lassoModeActive, isDrawing, isDraggingGroup, isZooming]);

  // Create bounds-aware transformer with smart snapping constraints
  const createBoundsAwareTransformer = useCallback((
    transformerRef: React.RefObject<Konva.Transformer | null>,
    onTransformEnd: (e: KonvaEventObject<Event>) => void,
    onTransformStart?: () => void
  ) => {
    return (
      <Transformer
        ref={transformerRef}
        onTransformStart={onTransformStart}
        onTransformEnd={onTransformEnd}
        ignoreStroke={true}
        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        boundBoxFunc={(oldBox, newBox) => {
          const canvasBounds = getCurrentCanvasBounds();
          const minSize = 10;

          // Ensure minimum size
          if (newBox.width < minSize || newBox.height < minSize) return oldBox;

          // Constrain to canvas bounds
          if (newBox.x < canvasBounds.x) {
            newBox.width += newBox.x - canvasBounds.x;
            newBox.x = canvasBounds.x;
          }
          if (newBox.y < canvasBounds.y) {
            newBox.height += newBox.y - canvasBounds.y;
            newBox.y = canvasBounds.y;
          }
          if (newBox.x + newBox.width > canvasBounds.x + canvasBounds.width) {
            newBox.width = canvasBounds.x + canvasBounds.width - newBox.x;
          }
          if (newBox.y + newBox.height > canvasBounds.y + canvasBounds.height) {
            newBox.height = canvasBounds.y + canvasBounds.height - newBox.y;
          }

          // Final size check
          if (newBox.width < minSize || newBox.height < minSize) return oldBox;

          return newBox;
        }}
      />
    );
  }, [getCurrentCanvasBounds]);

  console.log('🎯 Frame - Smart snapping system active, stageRef:', !!stageRef.current);

  return (
    <StageRefContext.Provider value={stageRef}>
      <Box overflow="hidden" maxW={boxWidth} maxH={boxHeight} position="relative">
        {/* Lasso mode toggle popup */}
        <LassoTogglePopup
          isLassoMode={lassoModeActive}
          isTouch={isTouchDevice}
          selectedCount={lockedSelection.length}
        />

        {/* Lasso mode toggle button */}
        <Box
          position="absolute"
          top="4"
          right="4"
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          p="2"
          zIndex="20"
          border="2px solid"
          borderColor={lassoModeActive ? 'pink.500' : 'gray.200'}
          cursor="pointer"
          onClick={() => onToggleLassoMode?.()}
          transition="all 0.2s"
        >
          <Box fontSize="xl" role="img" aria-label="lasso toggle">
            {lassoModeActive ? '🎯' : '👆'}
          </Box>
        </Box>

        {/* Zoom indicator */}
        {isZooming && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            px="4"
            py="2"
            borderRadius="md"
            fontSize="sm"
            zIndex="30"
            pointerEvents="none"
          >
            🔍 Zooming...
          </Box>
        )}

        {/* Canvas info display with debug info */}
        <Box
          position="absolute"
          bottom="4"
          left="4"
          bg="rgba(255, 255, 255, 0.9)"
          borderRadius="md"
          p="2"
          fontSize="xs"
          color="gray.600"
          zIndex="20"
          border="1px solid"
          borderColor="gray.200"
        >
          Canvas: {canvasWidth} × {canvasHeight}px
          <Box fontSize="10px" color="blue.600">
            Objects: {stageObjects.length}
          </Box>
          {GridSettings.snapToGrid && (
            <Box fontSize="10px" color="green.600">
              Smart Snap: ON (Tolerance: {GridSettings.snapTolerance}px)
            </Box>
          )}
          <Box fontSize="10px" color="purple.600">
            StageRef: {stageRef.current ? '✅' : '❌'}
          </Box>
        </Box>

        {/* Main Konva Stage */}
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          style={{
            backgroundColor: canvasBackgroundColor,
            cursor: cursorStyle,
            touchAction: 'none',
          }}
          draggable={!lassoModeActive && !isZooming && !isDraggingGroup}
          ref={stageRef}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageTouchStart}
          onTouchMove={handleStageTouchMove}
          onTouchEnd={handleStageTouchEnd}
          onTouchCancel={handleStageTouchCancel}
          onWheel={handleZoom}
          onDragMove={handleStageMove}
          onMouseLeave={cleanupDragState}
        >
          <Layer>
            {/* Canvas bounds and grid */}
            <CanvasBounds
              showBounds={true}
              showGrid={GridSettings.showGrid}
              gridSize={GridSettings.gridSize}
              showMajorGrid={GridSettings.showMajorGrid}
              majorGridMultiplier={GridSettings.majorGridMultiplier}
            />

            {/* Regular objects (not in lasso selection) */}
            {otherObjects.map((obj) => renderStageObject(obj, false))}

            {/* Lasso-selected objects in a group */}
            {lockedObjects.length > 0 && (
              <Group
                ref={groupRef}
                draggable={lassoModeActive && lockedObjects.length > 0}
                onDragStart={handleGroupDragStart}
                onDragEnd={handleGroupDragEnd}
              >
                {lockedObjects.map((obj) => renderStageObject(obj, true))}
              </Group>
            )}

            {/* Transformers with bounds constraints */}
            {createBoundsAwareTransformer(imageTransformer, onTransformerEnd, onTransformStart)}
            {createBoundsAwareTransformer(textTransformer, onTransformerEnd, onTransformStart)}
            {createBoundsAwareTransformer(multiTransformer, onTransformerEnd, onTransformStart)}

            {/* Lasso visual overlay */}
            <LassoVisual
              rawPoints={lassoPoints}
              smoothedPoints={smoothedPoints}
              isActive={lassoModeActive}
              isDrawing={isDrawing}
              previewSelection={previewSelection}
              isTouch={isTouchDevice && stats.isTouch}
            />
          </Layer>
        </Stage>
      </Box>
    </StageRefContext.Provider>
  );
};

export default Frame;