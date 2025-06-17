// src/pages/Studio/objects/ShapeObject/ShapeObject.tsx - FIXED VERSION
import Konva from 'konva';
import { Rect, Circle, RegularPolygon, Star, Arrow } from 'react-konva';
import useDragHandlers from '~/hooks/use-drag-handlers';
import { StageObject, StageObjectData } from '~/types/stage-object';
import { ShapeType } from '~/types/shape-type';
import { useMemo, useCallback, useContext } from 'react';

// Create a context to pass stageRef down
import React from 'react';

const StageRefContext = React.createContext<React.RefObject<Konva.Stage | null> | null>(null);

export type RegularPolygonData = {
  sides: number;
  radius: number;
} & StageObjectData &
  Record<string, any>;

export type StarData = {
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
} & StageObjectData &
  Record<string, any>;

export type ArrowData = {
  points: number[];
} & StageObjectData &
  Record<string, any>;

type Props = {
  obj: StageObject & { 
    isInLassoPreview?: boolean; 
    isSelected?: boolean;
    isLocked?: boolean;
    isInLockedSelection?: boolean;
    isDraggable?: boolean;
  };
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  stageRef?: React.RefObject<Konva.Stage | null>; // Add this prop
};

const ShapeObject = ({ obj, onSelect, stageRef }: Props) => {
  const { id, data, isInLassoPreview, isSelected, isLocked, isInLockedSelection, isDraggable } = obj;
  
  // Get stageRef from context if not passed as prop
  const contextStageRef = useContext(StageRefContext);
  const finalStageRef = stageRef || contextStageRef;
  
  // FIXED: Pass stageRef to drag handlers for smart snapping
  const { onDragStart, onDragEnd, onDragMove } = useDragHandlers(finalStageRef ?? undefined);

  console.log('🔧 ShapeObject render:', {
    id,
    hasStageRef: !!finalStageRef?.current,
    position: { x: data.x, y: data.y }
  });

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    
    // Prevent selection if object is locked
    if (isLocked) {
      console.log(`🔒 Shape ${id} is locked, cannot select`);
      return;
    }
    
    onSelect(e);
  }, [onSelect, isLocked, id]);

  // Enhanced visual feedback for different states
  const visualProps = useMemo(() => {
    const baseProps = {
      id,
      onClick: handleClick,
      onTap: handleClick,
      
      // FIXED: Add all three drag handlers with logging
      onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
        console.log('🎯 Shape onDragStart called for:', id);
        onDragStart(e);
      },
      onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
        console.log('🚀 Shape onDragMove called for:', id, 'at position:', e.target.position());
        onDragMove(e);
      },
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        console.log('🏁 Shape onDragEnd called for:', id);
        onDragEnd(e, obj);
      },
      
      x: data.x,
      y: data.y,
      draggable: isDraggable !== false ? data.draggable : false,
      scaleX: data.scaleX,
      scaleY: data.scaleY,
      offsetX: data.offsetX,
      offsetY: data.offsetY,
      rotation: data.rotation || 0,
      
      fill: data.fill,
      stroke: data.stroke,
      strokeWidth: data.strokeWidth || 0,
      
      perfectDrawEnabled: false,
      listening: !isLocked,
    };

    // Visual feedback based on state
    if (isLocked && !isInLockedSelection) {
      return {
        ...baseProps,
        opacity: 0.3,
        listening: false,
        draggable: false,
      };
    } else if (isInLockedSelection) {
      return {
        ...baseProps,
        shadowColor: '#10B981',
        shadowBlur: 8,
        shadowOpacity: 0.8,
        stroke: '#10B981',
        strokeWidth: Math.max(2, (data.strokeWidth || 0)),
      };
    } else if (isSelected) {
      return {
        ...baseProps,
        shadowColor: '#FF6B9D',
        shadowBlur: 10,
        shadowOpacity: 0.6,
      };
    } else if (isInLassoPreview) {
      return {
        ...baseProps,
        strokeWidth: Math.max(2, (data.strokeWidth || 0)),
        stroke: '#3B82F6',
        opacity: 0.8,
      };
    }

    return baseProps;
  }, [id, handleClick, onDragStart, onDragMove, onDragEnd, obj, data, isDraggable, isLocked, isInLockedSelection, isSelected, isInLassoPreview]);

  // Render appropriate shape based on type
  switch (data.shapeType) {
    case ShapeType.RECT:
      return (
        <Rect
          {...visualProps}
          width={data.width}
          height={data.height}
          cornerRadius={data.cornerRadius || 0}
        />
      );
    case ShapeType.CIRCLE:
      return (
        <Circle
          {...visualProps}
          radius={data.radius || data.width / 2}
        />
      );
    case ShapeType.POLYGON:
      return (
        <RegularPolygon
          {...visualProps}
          sides={(data as RegularPolygonData).sides || 6}
          radius={data.radius || data.width / 2}
        />
      );
    case ShapeType.STAR:
      return (
        <Star
          {...visualProps}
          numPoints={(data as StarData).numPoints || 5}
          innerRadius={(data as StarData).innerRadius || data.width / 4}
          outerRadius={(data as StarData).outerRadius || data.width / 2}
        />
      );
    case ShapeType.ARROW:
      return (
        <Arrow
          {...visualProps}
          points={(data as ArrowData).points || [0, 0, 50, 0]}
          pointerLength={data.pointerLength || 15}
          pointerWidth={data.pointerWidth || 15}
        />
      );
    default:
      return null;
  }
};

// Export the context for use in Frame component
export { StageRefContext };
export default ShapeObject;