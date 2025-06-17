import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onResize?: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
  onResize,
  onResizeStart,
  onResizeEnd,
}: UseResizableOptions) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    onResizeStart?.();
    
    // Add cursor style to body
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width, onResizeStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate new width (dragging left increases width, dragging right decreases)
    const deltaX = startXRef.current - e.clientX;
    const newWidth = startWidthRef.current + deltaX;
    
    // Constrain width within bounds
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    // Only update if width actually changed to prevent unnecessary renders
    if (constrainedWidth !== width) {
      setWidth(constrainedWidth);
      onResize?.(constrainedWidth);
    }
  }, [isResizing, minWidth, maxWidth, onResize, width]);

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    onResizeEnd?.();
    
    // Remove cursor style from body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizing, onResizeEnd]);

  // Set up global mouse events only when resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Update width when initialWidth changes (from Redux)
  useEffect(() => {
    if (!isResizing && initialWidth !== width) {
      setWidth(initialWidth);
    }
  }, [initialWidth, isResizing, width]);

  return {
    width,
    isResizing,
    handleMouseDown,
    setWidth: (newWidth: number) => {
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(constrainedWidth);
      onResize?.(constrainedWidth);
    },
  };
};