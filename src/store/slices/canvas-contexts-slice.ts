import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GRID_AND_SNAP_SETTINGS } from '~/consts/ui';
import { StageObject } from '~/types/stage-object';

export type ViewType = 'external' | 'internal';

// Grid settings type
export type GridSettings = {
    showGrid: boolean;
    gridSize: number;
    showMajorGrid: boolean;
    majorGridMultiplier: number;
    gridColor: string;
    majorGridColor: string;
    snapToGrid: boolean;
    snapTolerance: number;
};

export type CanvasContext = {
    objects: StageObject[];
    selected: string[];
    camera: {
        x: number;
        y: number;
        scale: number;
    };
    gridSettings: GridSettings;
    history: {
        past: StageObject[][];
        future: StageObject[][];
        maxSize: number;
    };
    isLoadedFromJSON: boolean;
    lastSaveTime: number;
    contextId: string;
};

export type CanvasContextsState = {
    contexts: Record<string, CanvasContext>;
    activeContextId: string | null;
    currentView: ViewType;
};

// Default grid settings
const createDefaultGridSettings = (): GridSettings => ({
    ...GRID_AND_SNAP_SETTINGS
});

const createEmptyContext = (contextId: string = 'default'): CanvasContext => ({
    objects: [],
    selected: [],
    camera: { x: 0, y: 0, scale: 1 },
    gridSettings: createDefaultGridSettings(), // NEW: Default grid settings
    history: {
        past: [],
        future: [],
        maxSize: 10
    },
    isLoadedFromJSON: false,
    lastSaveTime: 0,
    contextId,
});

const initialState: CanvasContextsState = {
    contexts: {
        "kitchen-main-cooking-wall-external": createEmptyContext("kitchen-main-cooking-wall-external"),
    },
    activeContextId: "kitchen-main-cooking-wall-external",
    currentView: 'external',
};

const canvasContextsSlice = createSlice({
    name: 'canvasContexts',
    initialState,
    reducers: {
        // Switch to a different context with proper ID tracking
        switchContext: (state, action: PayloadAction<{ tabId: string; viewType: ViewType }>) => {
            const { tabId, viewType } = action.payload;
            const contextId = `${tabId}-${viewType}`;

            console.log(`🔄 Switching context to: ${contextId}`);

            // Create context if it doesn't exist
            if (!state.contexts[contextId]) {
                console.log(`📝 Creating new context: ${contextId}`);
                state.contexts[contextId] = createEmptyContext(contextId);
            }

            state.activeContextId = contextId;
            state.currentView = viewType;
        },

        // Load elements from JSON into current active context
        loadElementsFromJSON: (state, action: PayloadAction<StageObject[]>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];

            console.log(`📥 Loading ${action.payload.length} elements into context: ${state.activeContextId}`);

            // Only load if not already loaded or if objects have changed
            const elementsChanged = JSON.stringify(context.objects) !== JSON.stringify(action.payload);

            if (!context.isLoadedFromJSON || elementsChanged) {
                context.objects = action.payload;
                context.selected = [];
                context.isLoadedFromJSON = true;

                // Clear history when loading from JSON - start fresh!
                context.history.past = [];
                context.history.future = [];
                context.lastSaveTime = Date.now();

                console.log(`🧹 Cleared history for fresh start after JSON load`);
            }
        },

        // Clone context (when duplicating a tab)
        cloneContext: (state, action: PayloadAction<{ fromTabId: string; toTabId: string }>) => {
            const { fromTabId, toTabId } = action.payload;

            console.log(`📋 Cloning contexts from ${fromTabId} to ${toTabId}`);

            // Clone both external and internal if they exist
            ['external', 'internal'].forEach(viewType => {
                const fromContextId = `${fromTabId}-${viewType}`;
                const toContextId = `${toTabId}-${viewType}`;

                if (state.contexts[fromContextId]) {
                    // Deep clone the context
                    const clonedContext = JSON.parse(JSON.stringify(state.contexts[fromContextId]));
                    // Reset history for cloned context and update ID
                    clonedContext.history = { past: [], future: [], maxSize: 50 };
                    clonedContext.lastSaveTime = Date.now();
                    clonedContext.contextId = toContextId;
                    state.contexts[toContextId] = clonedContext;
                }
            });
        },

        // Delete context (when deleting a tab)
        deleteContext: (state, action: PayloadAction<string>) => {
            const tabId = action.payload;

            console.log(`🗑️ Deleting contexts for tab: ${tabId}`);

            // Delete both external and internal contexts
            delete state.contexts[`${tabId}-external`];
            delete state.contexts[`${tabId}-internal`];

            // If active context was deleted, switch to first available
            if (state.activeContextId?.startsWith(tabId)) {
                const remainingContexts = Object.keys(state.contexts);
                state.activeContextId = remainingContexts.length > 0 ? remainingContexts[0] : null;
                console.log(`🔄 Switched to remaining context: ${state.activeContextId}`);
            }
        },

        // Update objects in current active context
        updateContextObjects: (state, action: PayloadAction<StageObject[]>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            console.log(`📝 Updating ${action.payload.length} objects in context: ${state.activeContextId}`);
            state.contexts[state.activeContextId].objects = action.payload;
        },

        // Add object WITHOUT auto-history (history saved externally)
        addObjectToContext: (state, action: PayloadAction<StageObject>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];

            console.log(`➕ Adding object ${action.payload.id} to context: ${state.activeContextId}`);
            context.objects.push(action.payload);
        },

        // Remove object WITHOUT auto-history (history saved externally)
        removeObjectFromContext: (state, action: PayloadAction<string | string[]>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];
            const idsToRemove = Array.isArray(action.payload) ? action.payload : [action.payload];

            console.log(`➖ Removing object(s) ${idsToRemove.join(', ')} from context: ${state.activeContextId}`);

            context.objects = context.objects.filter(
                obj => !idsToRemove.includes(obj.id)
            );
        },

        // Update object in current active context
        updateObjectInContext: (state, action: PayloadAction<{ id: string; data: Partial<StageObject['data']> }>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const { id, data } = action.payload;
            const context = state.contexts[state.activeContextId];
            const objectIndex = context.objects.findIndex(obj => obj.id === id);

            if (objectIndex !== -1) {
                context.objects[objectIndex].data = {
                    ...context.objects[objectIndex].data,
                    ...data,
                    updatedAt: Date.now()
                };
            }
        },

        // Update selection in current active context
        updateContextSelection: (state, action: PayloadAction<string[]>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            state.contexts[state.activeContextId].selected = action.payload;
        },

        // Update camera in current active context
        updateContextCamera: (state, action: PayloadAction<Partial<CanvasContext['camera']>>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            state.contexts[state.activeContextId].camera = {
                ...state.contexts[state.activeContextId].camera,
                ...action.payload
            };
        },

        // NEW: Update grid settings in current active context
        updateGridSettings: (state, action: PayloadAction<Partial<GridSettings>>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            console.log(`🎛️ Updating grid settings in context: ${state.activeContextId}`, action.payload);

            state.contexts[state.activeContextId].gridSettings = {
                ...state.contexts[state.activeContextId].gridSettings,
                ...action.payload
            };
        },

        // NEW: Toggle grid in current active context
        toggleGrid: (state) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];
            const newShowGrid = !context.gridSettings.showGrid;

            console.log(`🎛️ Toggling grid in context: ${state.activeContextId} -> ${newShowGrid}`);

            context.gridSettings.showGrid = newShowGrid;
        },

        // NEW: Set grid size for current context
        setGridSize: (state, action: PayloadAction<number>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const newSize = Math.max(5, Math.min(100, action.payload)); // Constrain between 5-100px

            console.log(`📏 Setting grid size in context: ${state.activeContextId} -> ${newSize}px`);

            state.contexts[state.activeContextId].gridSettings.gridSize = newSize;
        },

        // Save current state to history
        saveToContextHistory: (state) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];

            // Don't save identical states
            const currentStateString = JSON.stringify(context.objects);
            const lastStateString = context.history.past.length > 0
                ? JSON.stringify(context.history.past[context.history.past.length - 1])
                : '';

            if (currentStateString === lastStateString) {
                return;
            }

            console.log(`💾 Saving history for context: ${state.activeContextId} (${context.objects.length} objects)`);

            // Save current state to past
            context.history.past.push([...context.objects]);

            // Clear future when new action is performed
            context.history.future = [];
            context.lastSaveTime = Date.now();

            // Limit history size
            if (context.history.past.length > context.history.maxSize) {
                context.history.past.shift();
            }
        },

        // Context-aware undo
        undoInContext: (state) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];
            if (context.history.past.length === 0) return;

            console.log(`⏪ Undo in context: ${state.activeContextId} (${context.history.past.length} past states)`);

            // Save current state to future
            context.history.future.push([...context.objects]);

            // Restore previous state
            const previous = context.history.past.pop()!;
            context.objects = previous;

            // Clear selection after undo
            context.selected = [];

            // Limit future history size
            if (context.history.future.length > context.history.maxSize) {
                context.history.future.shift();
            }
        },

        // Context-aware redo
        redoInContext: (state) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const context = state.contexts[state.activeContextId];
            if (context.history.future.length === 0) return;

            console.log(`⏩ Redo in context: ${state.activeContextId} (${context.history.future.length} future states)`);

            // Save current state to past
            context.history.past.push([...context.objects]);

            // Restore future state
            const next = context.history.future.pop()!;
            context.objects = next;

            // Clear selection after redo
            context.selected = [];

            // Limit past history size
            if (context.history.past.length > context.history.maxSize) {
                context.history.past.shift();
            }
        },

        // Force reload from JSON
        forceReloadFromJSON: (state) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            state.contexts[state.activeContextId].isLoadedFromJSON = false;
        },

        // Clear context
        clearContext: (state, action: PayloadAction<string>) => {
            const contextId = action.payload;
            if (state.contexts[contextId]) {
                console.log(`🧹 Clearing context: ${contextId}`);
                state.contexts[contextId] = createEmptyContext(contextId);
            }
        },

        // Clear history for specific context
        clearContextHistory: (state, action: PayloadAction<string | undefined>) => {
            const contextId = action.payload || state.activeContextId;
            if (contextId && state.contexts[contextId]) {
                console.log(`🧹 Clearing history for context: ${contextId}`);
                state.contexts[contextId].history = { past: [], future: [], maxSize: 50 };
                state.contexts[contextId].lastSaveTime = Date.now();
            }
        },

        // Debug - Log all contexts
        debugLogContexts: (state) => {
            console.log('📊 Current Contexts:', {
                activeContextId: state.activeContextId,
                currentView: state.currentView,
                contexts: Object.keys(state.contexts).map(id => ({
                    id,
                    objectCount: state.contexts[id].objects.length,
                    pastCount: state.contexts[id].history.past.length,
                    futureCount: state.contexts[id].history.future.length,
                    selectedCount: state.contexts[id].selected.length,
                    gridSettings: state.contexts[id].gridSettings, // NEW: Include grid settings
                }))
            });
        },
        setSnapTolerance: (state, action: PayloadAction<number>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            const tolerance = Math.max(1, Math.min(20, action.payload)); // 1-20px range

            console.log(`📏 Setting snap tolerance in context: ${state.activeContextId} -> ${tolerance}px`);

            state.contexts[state.activeContextId].gridSettings.snapTolerance = tolerance;
        },

        // Enable/disable snap (though we'll keep it always enabled like Canva)
        setSnapToGrid: (state, action: PayloadAction<boolean>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            console.log(`🧲 Setting snap to grid in context: ${state.activeContextId} -> ${action.payload}`);

            state.contexts[state.activeContextId].gridSettings.snapToGrid = action.payload;
        },

        // Combined grid and snap update
        updateGridAndSnapSettings: (state, action: PayloadAction<Partial<GridSettings>>) => {
            if (!state.activeContextId || !state.contexts[state.activeContextId]) return;

            console.log(`🎛️ Updating grid and snap settings in context: ${state.activeContextId}`, action.payload);

            state.contexts[state.activeContextId].gridSettings = {
                ...state.contexts[state.activeContextId].gridSettings,
                ...action.payload
            };
        }
    },
});

export const {
    switchContext,
    loadElementsFromJSON,
    cloneContext,
    deleteContext,
    updateContextObjects,
    addObjectToContext,
    removeObjectFromContext,
    updateObjectInContext,
    updateContextSelection,
    updateContextCamera,
    updateGridSettings,
    toggleGrid,
    setGridSize,
    saveToContextHistory,
    undoInContext,
    redoInContext,
    forceReloadFromJSON,
    clearContext,
    clearContextHistory,
    debugLogContexts,
    setSnapTolerance,
    setSnapToGrid,
    updateGridAndSnapSettings
} = canvasContextsSlice.actions;

export default canvasContextsSlice.reducer;