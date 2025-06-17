import React, { useMemo } from 'react';
import { Rect, Line, Group, Text } from 'react-konva';
import { useAppContext } from '~/context/AppContext';

interface CanvasBoundsProps {
    showBounds?: boolean;
    showGrid?: boolean;
    gridSize?: number;
    showMajorGrid?: boolean;
    majorGridMultiplier?: number;
    gridColor?: string;
    majorGridColor?: string;
}

const CanvasBounds: React.FC<CanvasBoundsProps> = ({
    showBounds = true,
    showGrid = true,
    gridSize = 10,
    showMajorGrid = true,
    majorGridMultiplier = 5,
    gridColor = '#e2e8f0',
    majorGridColor = '#94a3b8',
}) => {
    const { getCurrentView } = useAppContext();

    const canvasData = getCurrentView();

    const bounds = useMemo(() => {
        if (!canvasData?.canvas) {
            return { width: 1080, height: 1080, x: 0, y: 0 };
        }

        return {
            width: canvasData.canvas.width,
            height: canvasData.canvas.height,
            x: 0,
            y: 0
        };
    }, [canvasData]);

    // Generate grid lines with major/minor distinction - FULL CANVAS COVERAGE
    const gridLines = useMemo(() => {
        if (!showGrid) {
            console.log('Grid disabled');
            return [];
        }

        console.log(`Generating grid: ${bounds.width}x${bounds.height}, gridSize: ${gridSize}`);
        const lines = [];
        const majorGridSize = showMajorGrid ? gridSize * majorGridMultiplier : gridSize;

        // Vertical lines - START FROM 0 and include edges
        for (let x = 0; x <= bounds.width; x += gridSize) {
            const isMajor = showMajorGrid && x % majorGridSize === 0;
            const isEdge = x === 0 || x === bounds.width;

            lines.push(
                <Line
                    key={`v-${x}`}
                    points={[bounds.x + x, bounds.y, bounds.x + x, bounds.y + bounds.height]}
                    stroke={isEdge ? "#cbd5e0" : isMajor ? majorGridColor : gridColor}
                    strokeWidth={isEdge ? 2 : isMajor ? 1 : 0.5}
                    opacity={isEdge ? 0.9 : isMajor ? 0.7 : 0.3}
                    listening={false}
                    perfectDrawEnabled={false}
                />
            );
        }

        // Horizontal lines - START FROM 0 and include edges
        for (let y = 0; y <= bounds.height; y += gridSize) {
            const isMajor = showMajorGrid && y % majorGridSize === 0;
            const isEdge = y === 0 || y === bounds.height;

            lines.push(
                <Line
                    key={`h-${y}`}
                    points={[bounds.x, bounds.y + y, bounds.x + bounds.width, bounds.y + y]}
                    stroke={isEdge ? "#cbd5e0" : isMajor ? majorGridColor : gridColor}
                    strokeWidth={isEdge ? 2 : isMajor ? 1 : 0.5}
                    opacity={isEdge ? 0.9 : isMajor ? 0.7 : 0.3}
                    listening={false}
                    perfectDrawEnabled={false}
                />
            );
        }

        console.log(`Generated ${lines.length} grid lines (${Math.ceil(bounds.width / gridSize + 1)} vertical + ${Math.ceil(bounds.height / gridSize + 1)} horizontal)`);
        return lines;
    }, [showGrid, bounds, gridSize, showMajorGrid, majorGridMultiplier]);

    // Don't render anything if both bounds and grid are disabled
    if (!showBounds && !showGrid) return null;

    return (
        <Group listening={false}>
            {/* Canvas Background - FIRST (so grid appears on top) */}
            {showBounds && (
                <Rect
                    x={bounds.x}
                    y={bounds.y}
                    width={bounds.width}
                    height={bounds.height}
                    fill={showGrid ? "transparent" : "white"}
                    stroke="#cbd5e0"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                    perfectDrawEnabled={false}
                />
            )}

            {/* Grid Lines - SECOND (rendered on top of background) - FULL CANVAS COVERAGE */}
            {showGrid && (
                <Group
                    listening={false}
                    perfectDrawEnabled={false}
                >
                    {gridLines}
                </Group>
            )}

            {/* Canvas Info and Markers - LAST (on top of everything) */}
            {showBounds && (
                <Group listening={false}>
                    {/* Size label */}
                    <Text
                        x={bounds.x + 10}
                        y={bounds.y + 10}
                        text={`Canvas: ${bounds.width} × ${bounds.height}px${showGrid ? ` | Grid: ${gridSize}px` : ''}`}
                        fontSize={12}
                        fontFamily="Inter, sans-serif"
                        fill="#64748b"
                        listening={false}
                        perfectDrawEnabled={false}
                    />

                    {/* Corner markers */}
                    <Rect
                        x={bounds.x}
                        y={bounds.y}
                        width={20}
                        height={20}
                        fill="#f1f5f9"
                        stroke="#64748b"
                        strokeWidth={1}
                        listening={false}
                        perfectDrawEnabled={false}
                    />

                    <Rect
                        x={bounds.x + bounds.width - 20}
                        y={bounds.y + bounds.height - 20}
                        width={20}
                        height={20}
                        fill="#f1f5f9"
                        stroke="#64748b"
                        strokeWidth={1}
                        listening={false}
                        perfectDrawEnabled={false}
                    />

                    {/* Grid info indicator (when grid is active) */}
                    {showGrid && (
                        <Group>
                            <Rect
                                x={bounds.x + bounds.width - 120}
                                y={bounds.y + 10}
                                width={110}
                                height={30}
                                fill="rgba(255, 255, 255, 0.9)"
                                stroke="#e2e8f0"
                                strokeWidth={1}
                                cornerRadius={4}
                                listening={false}
                                perfectDrawEnabled={false}
                            />
                            <Text
                                x={bounds.x + bounds.width - 115}
                                y={bounds.y + 20}
                                text={`Grid: ${gridSize}px`}
                                fontSize={10}
                                fontFamily="Inter, sans-serif"
                                fill="#64748b"
                                listening={false}
                                perfectDrawEnabled={false}
                            />
                        </Group>
                    )}

                    {/* Origin marker (0,0 point) */}
                    <Group>
                        <Line
                            points={[bounds.x - 5, bounds.y, bounds.x + 15, bounds.y]}
                            stroke="#ef4444"
                            strokeWidth={2}
                            listening={false}
                            perfectDrawEnabled={false}
                        />
                        <Line
                            points={[bounds.x, bounds.y - 5, bounds.x, bounds.y + 15]}
                            stroke="#ef4444"
                            strokeWidth={2}
                            listening={false}
                            perfectDrawEnabled={false}
                        />
                        <Text
                            x={bounds.x + 5}
                            y={bounds.y + 5}
                            text="0,0"
                            fontSize={10}
                            fontFamily="Inter, sans-serif"
                            fill="#ef4444"
                            listening={false}
                            perfectDrawEnabled={false}
                        />
                    </Group>
                </Group>
            )}
        </Group>
    );
};

export default CanvasBounds;