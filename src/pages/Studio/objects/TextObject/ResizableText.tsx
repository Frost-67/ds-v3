import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useRef } from 'react';
import { Text } from 'react-konva';
import useDragHandlers from '~/hooks/use-drag-handlers';
import { StageTextObjectData } from '~/types/stage-object';

type TProps = {
  shapeProps: StageTextObjectData;
  onDoubleClick: (e: KonvaEventObject<MouseEvent>) => void;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

const ResizableText = ({ shapeProps, onDoubleClick, onSelect }: TProps) => {
  const { id, data } = shapeProps;
  const { onDragStart, onDragEnd } = useDragHandlers();
  const textRef = useRef<Konva.Text | null>(null);

  // Simple resize handler
  const handleResize = () => {
    if (textRef.current !== null) {
      try {
        const textNode = textRef.current;
        const newWidth = textNode.width() * textNode.scaleX();
        textNode.setAttrs({
          width: Math.max(30, Math.min(1000, newWidth)),
          scaleX: 1,
          scaleY: 1,
        });
      } catch (error) {
        console.warn('Error resizing text:', error);
      }
    }
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    onSelect(e);
  };

  const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    onDoubleClick(e);
  };

  return (
    <Text
      id={id}
      ref={textRef}
      
      // Position and size
      x={data.x}
      y={data.y}
      width={data.width}
      height={typeof data.height === 'number' ? data.height : undefined}
      // Text content and styling
      text={data.text}
      fontFamily={data.fontFamily || 'Arial, sans-serif'} // Use system fonts only
      fontSize={Math.max(8, Math.min(200, data.fontSize || 16))}
      fontStyle={data.fontStyle}
      textDecoration={data.textDecoration}
      
      // Layout
      align={data.align}
      lineHeight={data.lineHeight}
      letterSpacing={data.letterSpacing}
      
      // Visual
      fill={data.fill}
      rotation={data.rotation || 0}
      
      // Transform
      draggable={data.draggable}
      scaleX={data.scaleX}
      scaleY={data.scaleY}
      offsetX={data.offsetX}
      offsetY={data.offsetY}
      
      // Performance
      perfectDrawEnabled={false}
      listening={true}
      
      // Events
      onTransform={handleResize}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={onDragStart}
      onDragEnd={(e) => onDragEnd(e, { id, data })}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    />
  );
};

export default ResizableText;