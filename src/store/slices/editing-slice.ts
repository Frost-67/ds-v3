import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StageObjectType } from '~/types/stage-object';

// Universal editing data structure
export interface EditingData {
  // Transform properties
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  
  // Visual properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  
  // Shape-specific properties
  shapeType?: string;
  radius?: number;
  cornerRadius?: number | number[];
  sides?: number;
  points?: number[];
  
  // Advanced visual effects
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  
  // Gradient properties
  fillPriority: 'color' | 'linear-gradient' | 'radial-gradient';
  fillLinearGradientStartPointX: number;
  fillLinearGradientStartPointY: number;
  fillLinearGradientEndPointX: number;
  fillLinearGradientEndPointY: number;
  fillLinearGradientColorStops: (string | number)[];
  fillRadialGradientStartPointX: number;
  fillRadialGradientStartPointY: number;
  fillRadialGradientStartRadius: number;
  fillRadialGradientEndPointX: number;
  fillRadialGradientEndPointY: number;
  fillRadialGradientEndRadius: number;
  fillRadialGradientColorStops: (string | number)[];
  
  // Text-specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  align?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: string;
  
  // Image-specific properties
  src?: string;
  filterNames?: string[];
  filterValues?: Record<string, number>;
  
  // Star-specific properties
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  
  // Arrow-specific properties
  pointerLength?: number;
  pointerWidth?: number;
  pointerAtBeginning?: boolean;
  pointerAtEnding?: boolean;
}

export interface EditingState {
  // Current object being edited
  selectedObjectId: string | null;
  selectedObjectType: StageObjectType | null;
  
  // Editing data (live edits before committing)
  editingData: EditingData | null;
  
  // Original data (for canceling edits)
  originalData: EditingData | null;
  
  // Edit history for this object
  editHistory: {
    past: EditingData[];
    future: EditingData[];
  };
  
  // UI state
  isEditing: boolean;
  isDirty: boolean; // Has unsaved changes
  activeEditingPanel: 'transform' | 'color' | 'effects' | 'text' | 'image' | null;
  
  // Transform state
  isTransforming: boolean;
  transformOrigin: { x: number; y: number };
  
  // Real-time preview
  previewMode: boolean;
}

const createDefaultEditingData = (objectType: StageObjectType): EditingData => ({
  // Transform
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  
  // Visual
  fill: '#A855F7',
  stroke: '',
  strokeWidth: 0,
  opacity: 1,
  
  // Effects
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  shadowOpacity: 0.5,
  
  // Gradients
  fillPriority: 'color',
  fillLinearGradientStartPointX: 0,
  fillLinearGradientStartPointY: 0,
  fillLinearGradientEndPointX: 100,
  fillLinearGradientEndPointY: 0,
  fillLinearGradientColorStops: [0, '#A855F7', 1, '#EC4899'],
  fillRadialGradientStartPointX: 50,
  fillRadialGradientStartPointY: 50,
  fillRadialGradientStartRadius: 0,
  fillRadialGradientEndPointX: 50,
  fillRadialGradientEndPointY: 50,
  fillRadialGradientEndRadius: 50,
  fillRadialGradientColorStops: [0, '#A855F7', 1, '#EC4899'],
  
  // Type-specific defaults
  ...(objectType === StageObjectType.SHAPE && {
    shapeType: 'rect',
    cornerRadius: 0,
  }),
  ...(objectType === StageObjectType.TEXT && {
    text: 'Sample Text',
    fontSize: 24,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    align: 'center',
    lineHeight: 1.2,
    letterSpacing: 0,
    textDecoration: '',
  }),
  ...(objectType === StageObjectType.IMAGE && {
    src: '',
    filterNames: [],
    filterValues: {},
  }),
});

const initialState: EditingState = {
  selectedObjectId: null,
  selectedObjectType: null,
  editingData: null,
  originalData: null,
  editHistory: {
    past: [],
    future: [],
  },
  isEditing: false,
  isDirty: false,
  activeEditingPanel: null,
  isTransforming: false,
  transformOrigin: { x: 0, y: 0 },
  previewMode: true,
};

const editingSlice = createSlice({
  name: 'editing',
  initialState,
  reducers: {
    // Start editing an object
    startEditing: (state, action: PayloadAction<{
      objectId: string;
      objectType: StageObjectType;
      objectData: Partial<EditingData>;
    }>) => {
      const { objectId, objectType, objectData } = action.payload;
      
      // Create complete editing data with defaults
      const defaultData = createDefaultEditingData(objectType);
      const completeData = { ...defaultData, ...objectData };
      
      state.selectedObjectId = objectId;
      state.selectedObjectType = objectType;
      state.editingData = completeData;
      state.originalData = completeData;
      state.isEditing = true;
      state.isDirty = false;
      state.editHistory = { past: [], future: [] };
      
      console.log(`🎨 Started editing ${objectType} object:`, objectId);
    },
    
    // Stop editing and discard changes
    stopEditing: (state) => {
      console.log('🛑 Stopped editing, discarding changes');
      state.selectedObjectId = null;
      state.selectedObjectType = null;
      state.editingData = null;
      state.originalData = null;
      state.isEditing = false;
      state.isDirty = false;
      state.activeEditingPanel = null;
      state.isTransforming = false;
    },
    
    // Update editing data (live preview)
    updateEditingData: (state, action: PayloadAction<Partial<EditingData>>) => {
      if (!state.editingData) return;
      
      // Save to history before making changes
      if (!state.editHistory.past.includes(state.editingData)) {
        state.editHistory.past.push({ ...state.editingData });
        // Limit history size
        if (state.editHistory.past.length > 20) {
          state.editHistory.past.shift();
        }
      }
      
      // Clear future when new edit is made
      state.editHistory.future = [];
      
      // Update editing data
      state.editingData = {
        ...state.editingData,
        ...action.payload,
      };
      
      state.isDirty = true;
      
      console.log('✏️ Updated editing data:', action.payload);
    },
    
    // Commit changes (save to canvas-contexts)
    commitChanges: (state) => {
      console.log('💾 Committing editing changes');
      state.isDirty = false;
      if (state.editingData) {
        state.originalData = { ...state.editingData };
      }
    },
    
    // Revert to original data
    revertChanges: (state) => {
      console.log('🔄 Reverting to original data');
      if (state.originalData) {
        state.editingData = { ...state.originalData };
        state.isDirty = false;
      }
    },
    
    // Set active editing panel
    setActivePanel: (state, action: PayloadAction<EditingState['activeEditingPanel']>) => {
      state.activeEditingPanel = action.payload;
    },
    
    // Transform operations
    startTransform: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.isTransforming = true;
      state.transformOrigin = action.payload;
    },
    
    endTransform: (state) => {
      state.isTransforming = false;
    },
    
    updateTransform: (state, action: PayloadAction<{
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      rotation?: number;
      scaleX?: number;
      scaleY?: number;
    }>) => {
      if (!state.editingData) return;
      
      const updates = action.payload;
      state.editingData = {
        ...state.editingData,
        ...updates,
      };
      
      state.isDirty = true;
    },
    
    // Color and fill operations
    updateFill: (state, action: PayloadAction<{
      fill?: string;
      fillPriority?: EditingData['fillPriority'];
      gradientData?: Partial<EditingData>;
    }>) => {
      if (!state.editingData) return;
      
      const { fill, fillPriority, gradientData } = action.payload;
      
      if (fill) state.editingData.fill = fill;
      if (fillPriority) state.editingData.fillPriority = fillPriority;
      if (gradientData) {
        Object.assign(state.editingData, gradientData);
      }
      
      state.isDirty = true;
    },
    
    // Stroke operations
    updateStroke: (state, action: PayloadAction<{
      stroke?: string;
      strokeWidth?: number;
    }>) => {
      if (!state.editingData) return;
      
      Object.assign(state.editingData, action.payload);
      state.isDirty = true;
    },
    
    // Shadow operations
    updateShadow: (state, action: PayloadAction<Partial<Pick<EditingData, 
      'shadowEnabled' | 'shadowColor' | 'shadowBlur' | 'shadowOffsetX' | 'shadowOffsetY' | 'shadowOpacity'
    >>>) => {
      if (!state.editingData) return;
      
      Object.assign(state.editingData, action.payload);
      state.isDirty = true;
    },
    
    // Shape-specific operations
    updateShapeProperties: (state, action: PayloadAction<{
      cornerRadius?: number | number[];
      radius?: number;
      sides?: number;
      numPoints?: number;
      innerRadius?: number;
      outerRadius?: number;
      pointerLength?: number;
      pointerWidth?: number;
      pointerAtBeginning?: boolean;
      pointerAtEnding?: boolean;
    }>) => {
      if (!state.editingData) return;
      
      Object.assign(state.editingData, action.payload);
      state.isDirty = true;
    },
    
    // Text operations
    updateTextProperties: (state, action: PayloadAction<Partial<Pick<EditingData,
      'text' | 'fontSize' | 'fontFamily' | 'fontStyle' | 'align' | 'lineHeight' | 'letterSpacing' | 'textDecoration'
    >>>) => {
      if (!state.editingData) return;
      
      Object.assign(state.editingData, action.payload);
      state.isDirty = true;
    },
    
    // Image operations
    updateImageProperties: (state, action: PayloadAction<{
      filterNames?: string[];
      filterValues?: Record<string, number>;
    }>) => {
      if (!state.editingData) return;
      
      Object.assign(state.editingData, action.payload);
      state.isDirty = true;
    },
    
    // History operations
    undoEdit: (state) => {
      if (state.editHistory.past.length === 0 || !state.editingData) return;
      
      // Move current to future
      state.editHistory.future.unshift({ ...state.editingData });
      
      // Restore from past
      const previous = state.editHistory.past.pop()!;
      state.editingData = previous;
      state.isDirty = true;
      
      console.log('⏪ Undid edit');
    },
    
    redoEdit: (state) => {
      if (state.editHistory.future.length === 0 || !state.editingData) return;
      
      // Move current to past
      state.editHistory.past.push({ ...state.editingData });
      
      // Restore from future
      const next = state.editHistory.future.shift()!;
      state.editingData = next;
      state.isDirty = true;
      
      console.log('⏩ Redid edit');
    },
    
    // Preview mode
    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.previewMode = action.payload;
    },
    
    // Utility: Duplicate current editing data
    duplicateEditingData: (state) => {
      if (!state.editingData) return;
      
      // This will be used when duplicating objects
      return { ...state.editingData };
    },
  },
});

export const {
  startEditing,
  stopEditing,
  updateEditingData,
  commitChanges,
  revertChanges,
  setActivePanel,
  startTransform,
  endTransform,
  updateTransform,
  updateFill,
  updateStroke,
  updateShadow,
  updateShapeProperties,
  updateTextProperties,
  updateImageProperties,
  undoEdit,
  redoEdit,
  setPreviewMode,
  duplicateEditingData,
} = editingSlice.actions;

export default editingSlice.reducer;