import Konva from 'konva';
import { Image } from 'konva/lib/shapes/Image';
import {  useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Image as KonvaImage, Rect } from 'react-konva';
import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from '~/consts/images';
import useDragHandlers from '~/hooks/use-drag-handlers';
import useImage from '~/hooks/use-image'; 
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { StageImageData, StageObject } from '~/types/stage-object';

type Props = {
  obj: StageObject & { 
    isInLassoPreview?: boolean; 
    isSelected?: boolean;
    isLocked?: boolean;
    isInLockedSelection?: boolean;
    isDraggable?: boolean;
  };
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

const ImageObject = ({ obj, onSelect }: Props) => {
  const { id, data, isInLassoPreview, isSelected, isLocked, isInLockedSelection, isDraggable } = obj;
  const { src, filterNames, filterValues, ...props } = data as StageImageData;
  const [image, status] = useImage(src, id); // Updated hook
  const [size, setSize] = useState({ width: MAX_IMAGE_WIDTH, height: MAX_IMAGE_HEIGHT });
  const imgRef = useRef<Image>(null);
  const { updateObject } = useCanvasContexts(); 

  const filters = useMemo(
    () => (filterNames[0] ? filterNames.map((f) => Konva.Filters[f]).filter((f) => f) : []),
    [filterNames],
  );

  const { onDragStart, onDragEnd, onDragMove } = useDragHandlers();

  useEffect(() => {
    if (image && status === 'loaded' && image instanceof window.Image) {
      const { width, height } = image;
      const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);

      const newSize = { width: width * ratio, height: height * ratio };
      setSize(newSize);
      updateObject(id, newSize); 
    }
  }, [image, id, updateObject, status]); // Added status to deps

  // Apply filters
  useEffect(() => {
    if (imgRef.current && image) {
      try {
        if (filterValues.brighten !== undefined) {
          imgRef.current.brightness(filterValues.brighten);
        }
        if (filters.length > 0) {
          imgRef.current.filters(filters);
        }
        imgRef.current.cache();
      } catch (error) {
        console.warn('Error applying image filters:', error);
      }
    }
  }, [image, filterValues, filters]);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    
    if (isLocked) {
      console.log(`🔒 Image ${id} is locked, cannot select`);
      return;
    }
    
    onSelect(e);
  }, [onSelect, isLocked, id]);

  // Show loading state or error state
  if (status === 'loading') {
    return (
      <Rect
        x={props.x}
        y={props.y}
        width={size.width}
        height={size.height}
        fill="#f0f0f0"
        stroke="#d0d0d0"
        strokeWidth={1}
        dash={[5, 5]}
        listening={false}
      />
    );
  }

  if (status === 'failed') {
    return (
      <Rect
        x={props.x}
        y={props.y}
        width={size.width}
        height={size.height}
        fill="#fee2e2"
        stroke="#ef4444"
        strokeWidth={2}
        listening={false}
      />
    );
  }

  // Enhanced visual styling based on state
  const imageProps = useMemo(() => {
    const validImage =
      (image && typeof window.Image !== 'undefined' && image instanceof window.Image) ||
      (typeof window.HTMLCanvasElement !== 'undefined' && image && image instanceof window.HTMLCanvasElement) ||
      (typeof window.OffscreenCanvas !== 'undefined' && image && image instanceof window.OffscreenCanvas)
        ? image
        : undefined;

    return {
      id,
      ref: imgRef,
      onClick: handleClick,
      onTap: handleClick,
      image: validImage,
      
      onDragStart,
      onDragMove,
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e, obj),
      
      x: props.x,
      y: props.y,
      width: size.width,
      height: size.height,
      draggable: isDraggable !== false ? props.draggable : false,
      scaleX: props.scaleX,
      scaleY: props.scaleY,
      offsetX: props.offsetX,
      offsetY: props.offsetY,
      rotation: props.rotation || 0,
      perfectDrawEnabled: false,
      listening: !isLocked,
      opacity: isLocked && !isInLockedSelection ? 0.3 : 1,
    };
  }, [
    id, imgRef, handleClick, image, onDragStart, onDragMove, onDragEnd, obj, props, size, isDraggable, isLocked, isInLockedSelection
  ]);

  // Selection highlight styles
  const selectionStyle = useMemo(() => {
    if (isInLockedSelection) {
      return {
        stroke: '#10B981',
        strokeWidth: 3,
        dash: [5, 5],
        opacity: 1,
      };
    } else if (isSelected) {
      return {
        stroke: '#FF6B9D',
        strokeWidth: 3,
        dash: [5, 5],
        opacity: 1,
      };
    } else if (isInLassoPreview) {
      return {
        stroke: '#3B82F6',
        strokeWidth: 2,
        dash: [3, 3],
        opacity: 0.7,
      };
    }
    return null;
  }, [isSelected, isInLassoPreview, isInLockedSelection]);

  return (
    <>
      <KonvaImage {...imageProps} />
      
      {/* Selection/Preview Highlight */}
      {selectionStyle && (
        <Rect
          x={props.x}
          y={props.y}
          width={size.width}
          height={size.height}
          stroke={selectionStyle.stroke}
          strokeWidth={selectionStyle.strokeWidth}
          dash={selectionStyle.dash}
          opacity={selectionStyle.opacity}
          fill="transparent"
          listening={false}
          perfectDrawEnabled={false}
        />
      )}

      {/* Lock Indicator */}
      {isLocked && !isInLockedSelection && (
        <Rect
          x={props.x + size.width - 25}
          y={props.y + 5}
          width={20}
          height={20}
          fill="rgba(239, 68, 68, 0.9)"
          cornerRadius={3}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
    </>
  );
};

export default ImageObject;