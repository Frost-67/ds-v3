import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './use-app-selector';
import { useCanvasContexts } from './use-canvas-contexts';
import {
    startEditing,
    stopEditing,
    updateEditingData,
    commitChanges,
    revertChanges,
    setActivePanel,
    updateTransform,
    updateFill,
    updateStroke,
    updateShadow,
    updateShapeProperties,
    updateTextProperties,
    updateImageProperties,
    undoEdit,
    redoEdit,
    EditingData,
    EditingState,
} from '~/store/slices/editing-slice';
import { StageObject, StageObjectType } from '~/types/stage-object';

export const useEditing = () => {
    const dispatch = useDispatch();
    const editingState = useAppSelector((state) => state.editing);
    const {
        objects,
        selected,
        updateObject,
        saveToHistory: saveCanvasHistory
    } = useCanvasContexts();

    // Convert StageObject to EditingData
    const convertToEditingData = useCallback((obj: StageObject): EditingData => {
        const data = obj.data;

        return {
            // Transform
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            rotation: data.rotation || 0,
            scaleX: data.scaleX,
            scaleY: data.scaleY,

            // Visual
            fill: data.fill || '#A855F7',
            stroke: data.stroke || '',
            strokeWidth: data.strokeWidth || 0,
            opacity: data.opacity || 1,

            // Shape properties
            shapeType: data.shapeType,
            radius: data.radius,
            cornerRadius: data.cornerRadius || 0,
            sides: data.sides,
            points: data.points,

            // Effects
            shadowEnabled: !!data.shadowEnabled,
            shadowColor: data.shadowColor || '#000000',
            shadowBlur: data.shadowBlur || 10,
            shadowOffsetX: data.shadowOffsetX || 5,
            shadowOffsetY: data.shadowOffsetY || 5,
            shadowOpacity: data.shadowOpacity || 0.5,

            // Gradients
            fillPriority: data.fillPriority || 'color',
            fillLinearGradientStartPointX: data.fillLinearGradientStartPointX || 0,
            fillLinearGradientStartPointY: data.fillLinearGradientStartPointY || 0,
            fillLinearGradientEndPointX: data.fillLinearGradientEndPointX || 100,
            fillLinearGradientEndPointY: data.fillLinearGradientEndPointY || 0,
            fillLinearGradientColorStops: data.fillLinearGradientColorStops || [0, '#A855F7', 1, '#EC4899'],
            fillRadialGradientStartPointX: data.fillRadialGradientStartPointX || 50,
            fillRadialGradientStartPointY: data.fillRadialGradientStartPointY || 50,
            fillRadialGradientStartRadius: data.fillRadialGradientStartRadius || 0,
            fillRadialGradientEndPointX: data.fillRadialGradientEndPointX || 50,
            fillRadialGradientEndPointY: data.fillRadialGradientEndPointY || 50,
            fillRadialGradientEndRadius: data.fillRadialGradientEndRadius || 50,
            fillRadialGradientColorStops: data.fillRadialGradientColorStops || [0, '#A855F7', 1, '#EC4899'],

            // Text properties
            text: data.text,
            fontSize: data.fontSize,
            fontFamily: data.fontFamily,
            fontStyle: data.fontStyle,
            align: data.align,
            lineHeight: data.lineHeight,
            letterSpacing: data.letterSpacing,
            textDecoration: data.textDecoration,

            // Image properties
            src: data.src,
            filterNames: data.filterNames || [],
            filterValues: data.filterValues || {},

            // Star properties
            numPoints: data.numPoints,
            innerRadius: data.innerRadius,
            outerRadius: data.outerRadius,

            // Arrow properties
            pointerLength: data.pointerLength,
            pointerWidth: data.pointerWidth,
            pointerAtBeginning: data.pointerAtBeginning,
            pointerAtEnding: data.pointerAtEnding,
        };
    }, []);

    // Convert EditingData back to canvas object format
    const convertFromEditingData = useCallback((editingData: EditingData, objectType: StageObjectType) => {
        const baseData = {
            // Transform
            x: editingData.x,
            y: editingData.y,
            width: editingData.width,
            height: editingData.height,
            rotation: editingData.rotation,
            scaleX: editingData.scaleX,
            scaleY: editingData.scaleY,

            // Visual
            fill: editingData.fill,
            stroke: editingData.stroke,
            strokeWidth: editingData.strokeWidth,
            opacity: editingData.opacity,

            // Effects
            shadowEnabled: editingData.shadowEnabled,
            shadowColor: editingData.shadowColor,
            shadowBlur: editingData.shadowBlur,
            shadowOffsetX: editingData.shadowOffsetX,
            shadowOffsetY: editingData.shadowOffsetY,
            shadowOpacity: editingData.shadowOpacity,

            // Gradients
            fillPriority: editingData.fillPriority,
            fillLinearGradientStartPointX: editingData.fillLinearGradientStartPointX,
            fillLinearGradientStartPointY: editingData.fillLinearGradientStartPointY,
            fillLinearGradientEndPointX: editingData.fillLinearGradientEndPointX,
            fillLinearGradientEndPointY: editingData.fillLinearGradientEndPointY,
            fillLinearGradientColorStops: editingData.fillLinearGradientColorStops,
            fillRadialGradientStartPointX: editingData.fillRadialGradientStartPointX,
            fillRadialGradientStartPointY: editingData.fillRadialGradientStartPointY,
            fillRadialGradientStartRadius: editingData.fillRadialGradientStartRadius,
            fillRadialGradientEndPointX: editingData.fillRadialGradientEndPointX,
            fillRadialGradientEndPointY: editingData.fillRadialGradientEndPointY,
            fillRadialGradientEndRadius: editingData.fillRadialGradientEndRadius,
            fillRadialGradientColorStops: editingData.fillRadialGradientColorStops,

            updatedAt: Date.now(),
        };

        // Add type-specific properties
        switch (objectType) {
            case StageObjectType.SHAPE:
                return {
                    ...baseData,
                    shapeType: editingData.shapeType,
                    radius: editingData.radius,
                    cornerRadius: editingData.cornerRadius,
                    sides: editingData.sides,
                    points: editingData.points,
                    numPoints: editingData.numPoints,
                    innerRadius: editingData.innerRadius,
                    outerRadius: editingData.outerRadius,
                    pointerLength: editingData.pointerLength,
                    pointerWidth: editingData.pointerWidth,
                    pointerAtBeginning: editingData.pointerAtBeginning,
                    pointerAtEnding: editingData.pointerAtEnding,
                };

            case StageObjectType.TEXT:
                return {
                    ...baseData,
                    text: editingData.text,
                    fontSize: editingData.fontSize,
                    fontFamily: editingData.fontFamily,
                    fontStyle: editingData.fontStyle,
                    align: editingData.align,
                    lineHeight: editingData.lineHeight,
                    letterSpacing: editingData.letterSpacing,
                    textDecoration: editingData.textDecoration,
                };

            case StageObjectType.IMAGE:
                return {
                    ...baseData,
                    src: editingData.src,
                    filterNames: editingData.filterNames,
                    filterValues: editingData.filterValues,
                };

            default:
                return baseData;
        }
    }, []);

    // Start editing when object is selected
    const startEditingObject = useCallback((objectId: string) => {
        const obj = objects.find(o => o.id === objectId);
        if (!obj) return;

        console.log('🎨 Starting to edit object:', objectId, obj.data.type);

        const editingData = convertToEditingData(obj);

        dispatch(startEditing({
            objectId,
            objectType: obj.data.type,
            objectData: editingData,
        }));
    }, [objects, convertToEditingData, dispatch]);

    // Stop editing
    const stopEditingObject = useCallback(() => {
        console.log('🛑 Stopping editing');
        dispatch(stopEditing());
    }, [dispatch]);

    // Apply changes to canvas
    const applyChanges = useCallback(() => {
        if (!editingState.selectedObjectId || !editingState.editingData || !editingState.selectedObjectType) {
            return;
        }

        console.log('💾 Applying editing changes to canvas');

        // Save to canvas history before applying changes
        saveCanvasHistory();

        // Convert editing data back to canvas format
        const canvasData = convertFromEditingData(editingState.editingData, editingState.selectedObjectType);

        // Update object in canvas
        updateObject(editingState.selectedObjectId, canvasData);

        // Mark as committed in editing state
        dispatch(commitChanges());
    }, [
        editingState.selectedObjectId,
        editingState.editingData,
        editingState.selectedObjectType,
        convertFromEditingData,
        updateObject,
        saveCanvasHistory,
        dispatch
    ]);

    // Auto-apply changes in preview mode
    useEffect(() => {
        if (editingState.previewMode && editingState.isDirty && editingState.editingData) {
            applyChanges();
        }
    }, [editingState.previewMode, editingState.isDirty, editingState.editingData, applyChanges]);

    // Auto-start editing when object is selected
    useEffect(() => {
        if (selected.length === 1) {
            const selectedId = selected[0];
            if (selectedId !== editingState.selectedObjectId) {
                startEditingObject(selectedId);
            }
        } else if (selected.length === 0 && editingState.isEditing) {
            // Auto-apply changes when deselecting
            if (editingState.isDirty) {
                applyChanges();
            }
            stopEditingObject();
        }
    }, [selected, editingState.selectedObjectId, editingState.isEditing, editingState.isDirty, startEditingObject, stopEditingObject, applyChanges]);

    // Update editing data wrapper
    const updateData = useCallback((data: Partial<EditingData>) => {
        dispatch(updateEditingData(data));
    }, [dispatch]);

    // Specialized update functions
    const updateTransformData = useCallback((data: Parameters<typeof updateTransform>[0]['payload']) => {
        dispatch(updateTransform(data));
    }, [dispatch]);

    const updateFillData = useCallback((data: Parameters<typeof updateFill>[0]['payload']) => {
        dispatch(updateFill(data));
    }, [dispatch]);

    const updateStrokeData = useCallback((data: Parameters<typeof updateStroke>[0]['payload']) => {
        dispatch(updateStroke(data));
    }, [dispatch]);

    const updateShadowData = useCallback((data: Parameters<typeof updateShadow>[0]['payload']) => {
        dispatch(updateShadow(data));
    }, [dispatch]);

    const updateShapeData = useCallback((data: Parameters<typeof updateShapeProperties>[0]['payload']) => {
        dispatch(updateShapeProperties(data));
    }, [dispatch]);

    const updateTextData = useCallback((data: Parameters<typeof updateTextProperties>[0]['payload']) => {
        dispatch(updateTextProperties(data));
    }, [dispatch]);

    const updateImageData = useCallback((data: Parameters<typeof updateImageProperties>[0]['payload']) => {
        dispatch(updateImageProperties(data));
    }, [dispatch]);

    // Panel management
    const setPanel = useCallback((panel: EditingState['activeEditingPanel']) => {
        dispatch(setActivePanel(panel));
    }, [dispatch]);

    // History
    const undo = useCallback(() => {
        dispatch(undoEdit());
    }, [dispatch]);

    const redo = useCallback(() => {
        dispatch(redoEdit());
    }, [dispatch]);

    // Revert changes
    const revert = useCallback(() => {
        dispatch(revertChanges());
    }, [dispatch]);

    // Get current editing object
    const getCurrentObject = useCallback(() => {
        if (!editingState.selectedObjectId) return null;
        return objects.find(obj => obj.id === editingState.selectedObjectId) || null;
    }, [editingState.selectedObjectId, objects]);

    // Check if specific editing features are available
    const getAvailableFeatures = useCallback(() => {
        if (!editingState.selectedObjectType) return {};

        const type = editingState.selectedObjectType;

        return {
            // Transform (available for all)
            transform: true,

            // Visual effects
            fill: true,
            stroke: type !== StageObjectType.IMAGE,
            shadow: true,
            gradients: type === StageObjectType.SHAPE,

            // Type-specific
            cornerRadius: type === StageObjectType.SHAPE && editingState.editingData?.shapeType === 'rect',
            textProperties: type === StageObjectType.TEXT,
            imageFilters: type === StageObjectType.IMAGE,
            shapeSpecific: type === StageObjectType.SHAPE,

            // Advanced shape features
            starProperties: type === StageObjectType.SHAPE && editingState.editingData?.shapeType === 'star',
            arrowProperties: type === StageObjectType.SHAPE && editingState.editingData?.shapeType === 'arrow',
            polygonProperties: type === StageObjectType.SHAPE && editingState.editingData?.shapeType === 'polygon',
        };
    }, [editingState.selectedObjectType, editingState.editingData?.shapeType]);

    return {
        // State
        ...editingState,
        currentObject: getCurrentObject(),
        availableFeatures: getAvailableFeatures(),

        // Actions
        startEditing: startEditingObject,
        stopEditing: stopEditingObject,
        applyChanges,
        revert,

        // Data updates
        updateData,
        updateTransform: updateTransformData,
        updateFill: updateFillData,
        updateStroke: updateStrokeData,
        updateShadow: updateShadowData,
        updateShape: updateShapeData,
        updateText: updateTextData,
        updateImage: updateImageData,

        // UI
        setPanel,

        // History
        undo,
        redo,

        // Utilities
        convertToEditingData,
        convertFromEditingData,
    };
};