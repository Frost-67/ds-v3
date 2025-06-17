
import React, { useMemo } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { LassoPoint } from '~/hooks/use-lasso-selection';

interface LassoVisualProps {
  rawPoints: LassoPoint[];
  smoothedPoints: LassoPoint[];
  isActive: boolean;
  isDrawing: boolean;
  previewSelection: string[];
  isTouch: boolean;
}

const LassoVisual: React.FC<LassoVisualProps> = ({
  rawPoints,
  smoothedPoints,
  isActive,
  isDrawing,
  previewSelection,
  isTouch,
}) => {
  // Convert points to Konva format - SAFE conversion
  const konvaPoints = useMemo(() => {
    const points = smoothedPoints.length > 2 ? smoothedPoints : rawPoints;
    const flatPoints: number[] = [];
    
    points.forEach(point => {
      flatPoints.push(point.x, point.y);
    });
    
    return flatPoints;
  }, [rawPoints, smoothedPoints]);

  // Dynamic styling based on selection state
  const visualStyle = useMemo(() => {
    if (!isActive) return null;

    const hasSelection = previewSelection.length > 0;
    
    return {
      // Main lasso line
      stroke: hasSelection ? '#FF6B9D' : '#A0AEC0',
      strokeWidth: isTouch ? 3 : 2,
      dash: isDrawing ? [8, 4] : [4, 2],
      opacity: isDrawing ? 0.8 : 0.6,
      
      // Fill area
      fill: hasSelection ? 'rgba(255, 107, 157, 0.15)' : 'rgba(160, 174, 192, 0.1)',
      fillEnabled: !isDrawing && konvaPoints.length >= 6,
    };
  }, [isActive, previewSelection.length, isTouch, isDrawing, konvaPoints.length]);

  // Start point indicator
  const startPoint = useMemo(() => {
    if (!isDrawing || rawPoints.length === 0) return null;
    
    return {
      x: rawPoints[0].x,
      y: rawPoints[0].y,
      radius: isTouch ? 8 : 6,
      fill: '#FF6B9D',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 0.7,
    };
  }, [isDrawing, rawPoints, isTouch]);

  if (!isActive || konvaPoints.length < 4) return null;

  return (
    <Group listening={false}>
      {/* Main Lasso Path */}
      {visualStyle && (
        <Line
          points={konvaPoints}
          stroke={visualStyle.stroke}
          strokeWidth={visualStyle.strokeWidth}
          dash={visualStyle.dash}
          fill={visualStyle.fill}
          fillEnabled={visualStyle.fillEnabled}
          closed={!isDrawing}
          opacity={visualStyle.opacity}
          perfectDrawEnabled={false}
          shadowEnabled={false}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {/* Start Point Indicator */}
      {startPoint && (
        <Circle
          x={startPoint.x}
          y={startPoint.y}
          radius={startPoint.radius}
          fill={startPoint.fill}
          stroke={startPoint.stroke}
          strokeWidth={startPoint.strokeWidth}
          opacity={startPoint.opacity}
          perfectDrawEnabled={false}
          shadowEnabled={false}
        />
      )}
    </Group>
  );
};

export default LassoVisual;