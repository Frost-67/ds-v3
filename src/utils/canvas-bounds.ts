// Enhanced utils/canvas-bounds.ts - Add snap functionality

export interface CanvasBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ObjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapSettings {
  gridSize: number;
  enabled: boolean;
  tolerance?: number; // Optional tolerance for snap sensitivity
}

export class CanvasBoundsManager {
  private bounds: CanvasBounds;

  constructor(bounds: CanvasBounds) {
    this.bounds = bounds;
  }

  /**
   * Update canvas bounds (when switching views/elevations)
   */
  updateBounds(newBounds: CanvasBounds) {
    this.bounds = newBounds;
  }

  /**
   * Get current canvas bounds
   */
  getBounds(): CanvasBounds {
    return { ...this.bounds };
  }

  /**
   * Snap coordinates to grid - Core snap functionality
   */
  snapToGrid(x: number, y: number, gridSize: number): { x: number; y: number } {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }

  /**
   * Snap with tolerance - for more natural feel during drag
   */
  snapToGridWithTolerance(
    x: number, 
    y: number, 
    gridSize: number, 
    tolerance: number = 5
  ): { x: number; y: number } {
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    // Only snap if within tolerance
    const deltaX = Math.abs(x - snappedX);
    const deltaY = Math.abs(y - snappedY);
    
    return {
      x: deltaX <= tolerance ? snappedX : x,
      y: deltaY <= tolerance ? snappedY : y
    };
  }

  /**
   * Enhanced position constraint with snap-to-grid
   */
  constrainPositionWithSnap(
    x: number, 
    y: number, 
    objectWidth: number, 
    objectHeight: number,
    snapSettings: SnapSettings
  ): { x: number; y: number } {
    let position = { x, y };

    // Apply snap first (if enabled)
    if (snapSettings.enabled && snapSettings.gridSize > 0) {
      if (snapSettings.tolerance) {
        position = this.snapToGridWithTolerance(x, y, snapSettings.gridSize, snapSettings.tolerance);
      } else {
        position = this.snapToGrid(x, y, snapSettings.gridSize);
      }
    }

    // Then apply canvas bounds constraint
    const constrainedX = Math.max(
      this.bounds.x,
      Math.min(this.bounds.x + this.bounds.width - objectWidth, position.x)
    );
    
    const constrainedY = Math.max(
      this.bounds.y,
      Math.min(this.bounds.y + this.bounds.height - objectHeight, position.y)
    );

    return { x: constrainedX, y: constrainedY };
  }

  /**
   * Original constrain position (for backward compatibility)
   */
  constrainPosition(
    x: number, 
    y: number, 
    objectWidth: number, 
    objectHeight: number
  ): { x: number; y: number } {
    const constrainedX = Math.max(
      this.bounds.x,
      Math.min(this.bounds.x + this.bounds.width - objectWidth, x)
    );
    
    const constrainedY = Math.max(
      this.bounds.y,
      Math.min(this.bounds.y + this.bounds.height - objectHeight, y)
    );

    return { x: constrainedX, y: constrainedY };
  }

  /**
   * Constrain object size to fit within canvas
   */
  constrainSize(
    width: number,
    height: number,
    x: number,
    y: number
  ): { width: number; height: number } {
    const maxWidth = this.bounds.width - (x - this.bounds.x);
    const maxHeight = this.bounds.height - (y - this.bounds.y);

    return {
      width: Math.max(10, Math.min(maxWidth, width)),
      height: Math.max(10, Math.min(maxHeight, height))
    };
  }

  /**
   * Check if object is within canvas bounds
   */
  isWithinBounds(objectBounds: ObjectBounds): boolean {
    return (
      objectBounds.x >= this.bounds.x &&
      objectBounds.y >= this.bounds.y &&
      objectBounds.x + objectBounds.width <= this.bounds.x + this.bounds.width &&
      objectBounds.y + objectBounds.height <= this.bounds.y + this.bounds.height
    );
  }

  /**
   * Get safe position for new objects (with snap-to-grid)
   */
  getSafePositionWithSnap(
    objectWidth: number, 
    objectHeight: number, 
    snapSettings: SnapSettings
  ): { x: number; y: number } {
    const padding = 20;
    const safeArea = {
      x: this.bounds.x + padding,
      y: this.bounds.y + padding,
      width: this.bounds.width - (padding * 2),
      height: this.bounds.height - (padding * 2)
    };

    // Get random position within safe area
    const randomX = Math.random() * Math.max(0, safeArea.width - objectWidth);
    const randomY = Math.random() * Math.max(0, safeArea.height - objectHeight);

    let position = {
      x: safeArea.x + randomX,
      y: safeArea.y + randomY
    };

    // Apply snap to the random position
    if (snapSettings.enabled && snapSettings.gridSize > 0) {
      position = this.snapToGrid(position.x, position.y, snapSettings.gridSize);
    }

    return position;
  }

  /**
   * Original getSafePosition (for backward compatibility)
   */
  getSafePosition(objectWidth: number, objectHeight: number): { x: number; y: number } {
    const padding = 20;
    const safeArea = {
      x: this.bounds.x + padding,
      y: this.bounds.y + padding,
      width: this.bounds.width - (padding * 2),
      height: this.bounds.height - (padding * 2)
    };

    const randomX = Math.random() * Math.max(0, safeArea.width - objectWidth);
    const randomY = Math.random() * Math.max(0, safeArea.height - objectHeight);

    return {
      x: safeArea.x + randomX,
      y: safeArea.y + randomY
    };
  }

  /**
   * Transform stage coordinates to canvas coordinates
   */
  stageToCanvas(stageX: number, stageY: number, stageScale: number, stagePos: { x: number; y: number }) {
    return {
      x: (stageX - stagePos.x) / stageScale,
      y: (stageY - stagePos.y) / stageScale
    };
  }

  /**
   * Transform canvas coordinates to stage coordinates
   */
  canvasToStage(canvasX: number, canvasY: number, stageScale: number, stagePos: { x: number; y: number }) {
    return {
      x: canvasX * stageScale + stagePos.x,
      y: canvasY * stageScale + stagePos.y
    };
  }
}

// Global instance - will be updated when context changes
export let canvasBoundsManager = new CanvasBoundsManager({
  width: 1080,
  height: 1080,
  x: 0,
  y: 0
});

export const updateCanvasBounds = (bounds: CanvasBounds) => {
  canvasBoundsManager.updateBounds(bounds);
};