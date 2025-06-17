export interface SnapConfig {
  // Visual guide settings
  tolerance: number;           // How close to snap lines before showing guides
  showGrid: boolean;           // Show grid-based guides
  gridSize: number;            // Grid size for snapping

  // Guide appearance
  guideColors: {
    objectEdge: string;        // Object edge alignment
    objectCenter: string;      // Center alignment  
    spacing: string;           // Equal spacing guides
    canvasCenter: string;      // Canvas center guides
    grid: string;              // Grid alignment guides
  };

  // Visual appearance settings
  lineWidth: number;           // Guide line thickness
  dashPattern: number[];       // Dash pattern [line_length, gap_length]
  opacity: number;             // Guide opacity (0-1)

  // Behavior
  maxGuides: number;           // Max guides to show at once (prevent clutter)
  showSpacingGuides: boolean;  // Show equal spacing guides
  showCenterGuides: boolean;   // Show center alignment guides
}

// COLOR THEMES - Easy presets you can switch between:
export const SNAP_COLOR_THEMES = {
  DEFAULT: {
    objectEdge: '#FF6B9D',    // Pink
    objectCenter: '#10B981',  // Green  
    spacing: '#F59E0B',       // Orange
    canvasCenter: '#3B82F6',  // Blue
    grid: '#94a3b8',          // Gray
  },
  VIBRANT: {
    objectEdge: '#FF1493',    // Hot pink
    objectCenter: '#00FF7F',  // Spring green
    spacing: '#FF4500',       // Red-orange
    canvasCenter: '#1E90FF',  // Dodger blue
    grid: '#D3D3D3',          // Light gray
  },
  NEON: {
    objectEdge: '#FF0080',    // Neon pink
    objectCenter: '#00FF00',  // Neon green
    spacing: '#FF8000',       // Neon orange
    canvasCenter: '#0080FF',  // Neon blue
    grid: '#808080',          // Medium gray
  },
  PASTEL: {
    objectEdge: '#FFB6C1',    // Light pink
    objectCenter: '#98FB98',  // Pale green
    spacing: '#FFDAB9',       // Peach puff
    canvasCenter: '#87CEEB',  // Sky blue
    grid: '#E0E0E0',          // Very light gray
  },
  HIGH_CONTRAST: {
    objectEdge: '#FF0000',    // Pure red
    objectCenter: '#00FF00',  // Pure green
    spacing: '#FFFF00',       // Pure yellow
    canvasCenter: '#0000FF',  // Pure blue
    grid: '#000000',          // Black
  },
} as const;

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  tolerance: 8,               // 8px tolerance for showing guides
  showGrid: true,
  gridSize: 20,
  guideColors: SNAP_COLOR_THEMES.DEFAULT,
  lineWidth: 3,               // Thicker lines for better visibility
  dashPattern: [8, 4],        // Longer dashes [line, gap]
  opacity: 0.9,               // More opaque guides
  maxGuides: 4,               // Max 4 guides to prevent clutter
  showSpacingGuides: true,
  showCenterGuides: true,
};

// EASY USAGE EXAMPLE:
export const getCustomSnapConfig = (theme: keyof typeof SNAP_COLOR_THEMES = 'DEFAULT'): SnapConfig => ({
  ...DEFAULT_SNAP_CONFIG,
  guideColors: SNAP_COLOR_THEMES[theme],
});

// Preset configurations for different use cases
export const SNAP_PRESETS = {
  PRECISE: {
    ...DEFAULT_SNAP_CONFIG,
    tolerance: 4,
    gridSize: 10,
    lineWidth: 2,
    maxGuides: 8,
  },
  RELAXED: {
    ...DEFAULT_SNAP_CONFIG,
    tolerance: 12,
    gridSize: 25,
    lineWidth: 4,
    maxGuides: 3,
  },
  GRID_ONLY: {
    ...DEFAULT_SNAP_CONFIG,
    showSpacingGuides: false,
    showCenterGuides: false,
  },
  OBJECTS_ONLY: {
    ...DEFAULT_SNAP_CONFIG,
    showGrid: false,
  },
} as const;

export const SNAP_UI_CONFIG = {
  defaultConfig: DEFAULT_SNAP_CONFIG,
  presets: SNAP_PRESETS,
  // Toolbar controls
  controls: [
    {
      id: 'grid-guides',
      label: 'Grid Guides',
      icon: '⊞',
      tooltip: 'Show grid alignment guides',
    },
    {
      id: 'object-guides', 
      label: 'Object Guides',
      icon: '⚡',
      tooltip: 'Show object alignment guides',
    },
    {
      id: 'spacing-guides',
      label: 'Spacing Guides', 
      icon: '↔️',
      tooltip: 'Show equal spacing guides',
    },
  ],
} as const;