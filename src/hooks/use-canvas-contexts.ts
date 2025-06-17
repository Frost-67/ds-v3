import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './use-app-selector';
import {
    switchContext,
    cloneContext,
    deleteContext,
    updateContextObjects,
    addObjectToContext,
    updateObjectInContext,
    updateContextSelection,
    updateContextCamera,
    saveToContextHistory,
    undoInContext,
    redoInContext,
    loadElementsFromJSON,
    ViewType,
    updateGridSettings,
    toggleGrid,
    setGridSize,
    GridSettings,
} from '~/store/slices/canvas-contexts-slice';
import { StageObject, StageObjectType } from '~/types/stage-object';
import { CanvasElement } from '~/types/project-config.types';
import { useAppContext } from '~/context/AppContext';
import { canvasBoundsManager, updateCanvasBounds } from '~/utils/canvas-bounds';
import { GRID_AND_SNAP_SETTINGS } from '~/consts/ui';

export const useCanvasContexts = () => {
    const dispatch = useDispatch();
    const canvasContextsState = useAppSelector((state) => state.canvasContexts);
    const { getCurrentView, activeUnitId, activeElevationId, activeView } = useAppContext();

    // Get current active context data
    const activeContext = canvasContextsState.activeContextId
        ? canvasContextsState.contexts[canvasContextsState.activeContextId]
        : null;

    // Generate current context ID based on app state
    const getCurrentContextId = useCallback(() => {
        if (!activeUnitId || !activeElevationId) return null;
        return `${activeUnitId}-${activeElevationId}-${activeView}`;
    }, [activeUnitId, activeElevationId, activeView]);

    // Convert JSON element to StageObject format
    const convertJSONElementToStageObject = useCallback((element: CanvasElement): StageObject => {
        const baseData = {
            type: element.type as StageObjectType,
            x: element.x,
            y: element.y,
            width: element.width || 100,
            height: element.height || 100,
            draggable: true,
            z_index: element.z_index || 0,
            updatedAt: element.updatedAt || Date.now(),
            offsetX: element.offsetX || 0,
            offsetY: element.offsetY || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
        };

        // Add type-specific properties
        switch (element.type) {
            case 'shape':
                return {
                    id: element.id,
                    data: {
                        ...baseData,
                        shapeType: element.shapeType || 'rect',
                        fill: element.fill || '#cccccc',
                        stroke: element.stroke,
                        strokeWidth: element.strokeWidth || 0,
                        radius: element.radius,
                    }
                };

            case 'text':
                return {
                    id: element.id,
                    data: {
                        ...baseData,
                        text: element.text || 'Text',
                        fontSize: element.fontSize || 16,
                        fontFamily: element.fontFamily || 'Inter',
                        fill: element.fill || '#000000',
                        fontStyle: element.fontStyle || 'normal',
                        align: element.align || 'left',
                        lineHeight: element.lineHeight || 1.2,
                        letterSpacing: element.letterSpacing || 0,
                        rotation: element.rotation || 0,
                        textDecoration: element.textDecoration || '',
                        fontVariants: element.fontVariants || ['400'],
                        webFont: element.webFont || false,
                    }
                };

            case 'image':
                return {
                    id: element.id,
                    data: {
                        ...baseData,
                        src: element.src || '',
                        filterNames: [],
                        filterValues: {},
                    }
                };

            default:
                return {
                    id: element.id,
                    data: baseData
                };
        }
    }, []);

    // Load elements with bounds checking
    const loadElementsFromJSONData = useCallback((elements: CanvasElement[]) => {
        const stageObjects = elements.map(convertJSONElementToStageObject);

        // Update canvas bounds when loading new elements
        const currentViewData = getCurrentView();
        if (currentViewData?.canvas) {
            updateCanvasBounds({
                width: currentViewData.canvas.width,
                height: currentViewData.canvas.height,
                x: 0,
                y: 0
            });

            // Constrain loaded objects to bounds
            const constrainedObjects = stageObjects.map(obj => {
                const constrainedPos = canvasBoundsManager.constrainPosition(
                    obj.data.x,
                    obj.data.y,
                    obj.data.width,
                    obj.data.height
                );

                if (constrainedPos.x !== obj.data.x || constrainedPos.y !== obj.data.y) {
                    console.log(`Constrained loaded object ${obj.id} to bounds`);
                    return {
                        ...obj,
                        data: {
                            ...obj.data,
                            x: constrainedPos.x,
                            y: constrainedPos.y
                        }
                    };
                }
                return obj;
            });

            dispatch(loadElementsFromJSON(constrainedObjects));
        } else {
            dispatch(loadElementsFromJSON(stageObjects));
        }
    }, [dispatch, convertJSONElementToStageObject, getCurrentView]);

    // Context switching with proper context ID generation
    const switchToContext = useCallback((tabId: string, viewType: ViewType) => {
        console.log(`🔄 Switching to context: ${tabId}-${viewType}`);

        dispatch(switchContext({ tabId, viewType }));

        // Update bounds for new context
        const currentViewData = getCurrentView();
        if (currentViewData?.canvas) {
            updateCanvasBounds({
                width: currentViewData.canvas.width,
                height: currentViewData.canvas.height,
                x: 0,
                y: 0
            });
        }

        // Load JSON data for new context
        if (currentViewData && currentViewData.elements) {
            setTimeout(() => {
                loadElementsFromJSONData(currentViewData.elements);

                if (currentViewData.camera) {
                    dispatch(updateContextCamera(currentViewData.camera));
                }
            }, 0);
        }
    }, [dispatch, getCurrentView, loadElementsFromJSONData]);

    // Ensure we're operating on the correct context
    const ensureCorrectContext = useCallback(() => {
        const expectedContextId = getCurrentContextId();
        const currentContextId = canvasContextsState.activeContextId;

        if (expectedContextId && expectedContextId !== currentContextId) {
            console.log(`🔄 Auto-switching from ${currentContextId} to ${expectedContextId}`);
            if (activeUnitId && activeElevationId) {
                switchToContext(`${activeUnitId}-${activeElevationId}`, activeView);
            }
        }

        return expectedContextId;
    }, [getCurrentContextId, canvasContextsState.activeContextId, activeUnitId, activeElevationId, activeView, switchToContext]);

    // Clone entire tab (both external and internal contexts)
    const cloneTabContext = useCallback((fromTabId: string, toTabId: string) => {
        dispatch(cloneContext({ fromTabId, toTabId }));
    }, [dispatch]);

    // Delete tab contexts
    const deleteTabContext = useCallback((tabId: string) => {
        dispatch(deleteContext(tabId));
    }, [dispatch]);
    // Get current grid settings
    const getCurrentGridSettings = useCallback((): GridSettings => {
        const contextId = ensureCorrectContext();
        if (contextId && activeContext) {
            return activeContext.gridSettings;
        }

        // Return default if no context
        return {
            ...GRID_AND_SNAP_SETTINGS
        };
    }, [activeContext, ensureCorrectContext]);
    const createObject = useCallback((objectData: StageObject['data']) => {
        ensureCorrectContext();

        // Get current grid settings from context
        const currentGridSettings = getCurrentGridSettings();
        console.log(`🔧 Current grid settings:`, currentGridSettings);
        // Get safe position with snap-to-grid
        const snapSettings = {
            enabled: currentGridSettings.snapToGrid,
            gridSize: currentGridSettings.gridSize,
            tolerance: currentGridSettings.snapTolerance
        };

        const safePosition = canvasBoundsManager.getSafePositionWithSnap(
            objectData.width || 100,
            objectData.height || 100,
            snapSettings
        );

        const newObject: StageObject = {
            id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: {
                ...objectData,
                x: safePosition.x,
                y: safePosition.y,
                updatedAt: Date.now()
            }
        };

        console.log(`📝 Created object ${newObject.id} at snapped position (${safePosition.x}, ${safePosition.y})`);

        // Only save history if context has existing objects
        const context = activeContext;
        if (context && context.objects.length > 0) {
            dispatch(saveToContextHistory());
        }
        dispatch(addObjectToContext(newObject));

        return newObject;
    }, [dispatch, ensureCorrectContext, canvasContextsState.activeContextId, activeContext, getCurrentGridSettings]);

    const updateObjectWithSnap = useCallback((id: string, data: Partial<StageObject['data']>, forceSnap: boolean = false) => {
        ensureCorrectContext();

        // Get current grid settings
        const currentGridSettings = getCurrentGridSettings();

        // If position is being updated and snap is enabled, apply snap
        if ((data.x !== undefined || data.y !== undefined) && (currentGridSettings.snapToGrid || forceSnap)) {
            const currentObject = activeContext?.objects.find(obj => obj.id === id);
            if (currentObject) {
                const newX = data.x !== undefined ? data.x : currentObject.data.x;
                const newY = data.y !== undefined ? data.y : currentObject.data.y;
                const width = data.width || currentObject.data.width;
                const height = data.height || currentObject.data.height;

                const snappedPosition = canvasBoundsManager.constrainPositionWithSnap(
                    newX, newY, width, height,
                    {
                        enabled: currentGridSettings.snapToGrid || forceSnap,
                        gridSize: currentGridSettings.gridSize,
                        tolerance: forceSnap ? 0 : currentGridSettings.snapTolerance // Force exact snap when requested
                    }
                );

                // Update data with snapped position
                data = {
                    ...data,
                    x: snappedPosition.x,
                    y: snappedPosition.y
                };

                console.log(`🧲 Snapped object ${id} position update: (${newX}, ${newY}) → (${snappedPosition.x}, ${snappedPosition.y})`);
            }
        }

        // If size is being updated, constrain to canvas
        if (data.width !== undefined || data.height !== undefined) {
            const currentObject = activeContext?.objects.find(obj => obj.id === id);
            if (currentObject) {
                const x = data.x || currentObject.data.x;
                const y = data.y || currentObject.data.y;
                const newWidth = data.width !== undefined ? data.width : currentObject.data.width;
                const newHeight = data.height !== undefined ? data.height : currentObject.data.height;

                const constrainedSize = canvasBoundsManager.constrainSize(
                    newWidth, newHeight, x, y
                );

                data = {
                    ...data,
                    width: constrainedSize.width,
                    height: constrainedSize.height
                };
            }
        }

        dispatch(updateObjectInContext({ id, data }));
    }, [dispatch, activeContext?.objects, ensureCorrectContext, getCurrentGridSettings]);

    // Snap all objects to grid (utility function)
    const snapAllObjectsToGrid = useCallback(() => {
        if (!activeContext?.objects.length) return;

        // Get current grid settings
        const currentGridSettings = getCurrentGridSettings();

        if (!currentGridSettings.snapToGrid) return;

        console.log(`🧲 Snapping all ${activeContext.objects.length} objects to grid`);

        const snappedObjects = activeContext.objects.map(obj => {
            const snappedPosition = canvasBoundsManager.constrainPositionWithSnap(
                obj.data.x,
                obj.data.y,
                obj.data.width,
                obj.data.height,
                {
                    enabled: true,
                    gridSize: currentGridSettings.gridSize,
                    tolerance: 0 // Force exact snap
                }
            );

            if (snappedPosition.x !== obj.data.x || snappedPosition.y !== obj.data.y) {
                return {
                    ...obj,
                    data: {
                        ...obj.data,
                        x: snappedPosition.x,
                        y: snappedPosition.y,
                        updatedAt: Date.now()
                    }
                };
            }
            return obj;
        });

        dispatch(updateContextObjects(snappedObjects));
        console.log('🧲 All objects snapped to grid');
    }, [activeContext?.objects, dispatch, getCurrentGridSettings]);
    // Grid management functions 
    const updateGridSettingsForContext = useCallback((settings: Partial<GridSettings>) => {
        ensureCorrectContext();
        dispatch(updateGridSettings(settings));
    }, [dispatch, ensureCorrectContext]);

    const toggleGridForContext = useCallback(() => {
        ensureCorrectContext();
        dispatch(toggleGrid());
    }, [dispatch, ensureCorrectContext]);

    const setGridSizeForContext = useCallback((size: number) => {
        ensureCorrectContext();
        dispatch(setGridSize(size));
    }, [dispatch, ensureCorrectContext]);

    const replaceAllObjects = useCallback((objects: StageObject[]) => {
        ensureCorrectContext();

        // Constrain all objects to bounds
        const constrainedObjects = objects.map(obj => {
            const constrainedPos = canvasBoundsManager.constrainPosition(
                obj.data.x,
                obj.data.y,
                obj.data.width,
                obj.data.height
            );

            if (constrainedPos.x !== obj.data.x || constrainedPos.y !== obj.data.y) {
                return {
                    ...obj,
                    data: {
                        ...obj.data,
                        x: constrainedPos.x,
                        y: constrainedPos.y
                    }
                };
            }
            return obj;
        });

        dispatch(updateContextObjects(constrainedObjects));
    }, [dispatch, ensureCorrectContext]);

    // Selection management
    const updateSelection = useCallback((selectedIds: string[]) => {
        ensureCorrectContext();
        dispatch(updateContextSelection(selectedIds));
    }, [dispatch, ensureCorrectContext]);

    // Camera management
    const updateCamera = useCallback((camera: { x?: number; y?: number; scale?: number }) => {
        ensureCorrectContext();
        dispatch(updateContextCamera(camera));
    }, [dispatch, ensureCorrectContext]);

    // Manual history saving (only when needed)
    const saveToHistory = useCallback(() => {
        const contextId = ensureCorrectContext();
        if (contextId && activeContext) {
            console.log(`💾 Manual save history for context: ${contextId}`);
            dispatch(saveToContextHistory());
        }
    }, [dispatch, activeContext, ensureCorrectContext]);

    // Context-aware undo
    const undo = useCallback(() => {
        const contextId = ensureCorrectContext();
        if (contextId && activeContext) {
            console.log(`⏪ Undo in context: ${contextId}`);
            dispatch(undoInContext());
        }
    }, [dispatch, activeContext, ensureCorrectContext]);

    // Context-aware redo
    const redo = useCallback(() => {
        const contextId = ensureCorrectContext();
        if (contextId && activeContext) {
            console.log(`⏩ Redo in context: ${contextId}`);
            dispatch(redoInContext());
        }
    }, [dispatch, activeContext, ensureCorrectContext]);

    // Get history status for UI
    const getHistoryStatus = useCallback(() => {
        const contextId = ensureCorrectContext();
        if (!contextId || !activeContext) {
            return { canUndo: false, canRedo: false, pastCount: 0, futureCount: 0 };
        }

        const history = activeContext.history;
        return {
            canUndo: history.past.length > 0,
            canRedo: history.future.length > 0,
            pastCount: history.past.length,
            futureCount: history.future.length,
            contextId: contextId
        };
    }, [activeContext, ensureCorrectContext]);

    // Utility functions
    const getContextId = useCallback((tabId: string, viewType: ViewType) => {
        return `${tabId}-${viewType}`;
    }, []);

    const contextExists = useCallback((tabId: string, viewType: ViewType) => {
        const contextId = getContextId(tabId, viewType);
        return Boolean(canvasContextsState.contexts[contextId]);
    }, [canvasContextsState.contexts, getContextId]);

    // Get current canvas bounds
    const getCurrentCanvasBounds = useCallback(() => {
        return canvasBoundsManager.getBounds();
    }, []);

    // Check if object is within bounds
    const isObjectWithinBounds = useCallback((objectId: string): boolean => {
        const obj = activeContext?.objects.find(o => o.id === objectId);
        if (!obj) return false;

        return canvasBoundsManager.isWithinBounds({
            x: obj.data.x,
            y: obj.data.y,
            width: obj.data.width,
            height: obj.data.height
        });
    }, [activeContext?.objects]);

    const syncToJSON = useCallback(() => {
        if (!activeContext || !activeUnitId || !activeElevationId) return null;

        // Convert StageObjects back to CanvasElements
        const elements: CanvasElement[] = activeContext.objects.map((obj) => ({
            id: obj.id,
            type: obj.data.type,
            x: obj.data.x,
            y: obj.data.y,
            width: obj.data.width,
            height: obj.data.height,
            draggable: obj.data.draggable,
            z_index: obj.data.z_index,
            updatedAt: obj.data.updatedAt,
            offsetX: obj.data.offsetX,
            offsetY: obj.data.offsetY,
            scaleX: obj.data.scaleX,
            scaleY: obj.data.scaleY,
            // Type-specific properties
            ...(obj.data.type === 'shape' && {
                shapeType: obj.data.shapeType,
                fill: obj.data.fill,
                stroke: obj.data.stroke,
                strokeWidth: obj.data.strokeWidth,
                radius: obj.data.radius,
            }),
            ...(obj.data.type === 'text' && {
                text: obj.data.text,
                fontSize: obj.data.fontSize,
                fontFamily: obj.data.fontFamily,
                fill: obj.data.fill,
                fontStyle: obj.data.fontStyle,
                align: obj.data.align,
                lineHeight: obj.data.lineHeight,
                letterSpacing: obj.data.letterSpacing,
                rotation: obj.data.rotation,
                textDecoration: obj.data.textDecoration,
                fontVariants: obj.data.fontVariants,
                webFont: obj.data.webFont,
            }),
            ...(obj.data.type === 'image' && {
                src: obj.data.src,
            }),
        }));

        return {
            elements,
            camera: activeContext.camera
        };
    }, [activeContext, activeUnitId, activeElevationId]);

    return {
        // State
        activeContextId: canvasContextsState.activeContextId,
        currentView: canvasContextsState.currentView,
        activeContext,
        allContexts: canvasContextsState.contexts,

        // Current context data (for easy access)
        objects: activeContext?.objects || [],
        selected: activeContext?.selected || [],
        camera: activeContext?.camera || { x: 0, y: 0, scale: 1 },

        // Context management
        switchToContext,
        cloneTabContext,
        deleteTabContext,
        ensureCorrectContext,
        getCurrentContextId,

        // Object operations (with bounds checking)
        createObject,
        updateObject: updateObjectWithSnap,
        updateObjectWithSnap,
        replaceAllObjects,
        snapAllObjectsToGrid,
        // Selection operations
        updateSelection,

        // Camera operations
        updateCamera,

        // History operations with context awareness
        saveToHistory,
        undo,
        redo,
        getHistoryStatus,

        // JSON integration
        loadElementsFromJSONData,
        syncToJSON,

        // Utilities
        getContextId,
        contextExists,

        // Bounds-related functions
        getCurrentCanvasBounds,
        isObjectWithinBounds,
        // constrainAllObjects,

        // Grid management
        gridSettings: activeContext?.gridSettings || getCurrentGridSettings(),
        updateGridSettings: updateGridSettingsForContext,
        toggleGrid: toggleGridForContext,
        setGridSize: setGridSizeForContext,
        getCurrentGridSettings,
    };
};