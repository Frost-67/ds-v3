// src/pages/Studio/EditingToolbar/EditingToolbar.tsx - ENHANCED VERSION
import { HStack, Icon, IconButton, Spacer, TabIndicator, Tooltip, Badge, VStack, Tabs, TabList, Tab, Button } from '@chakra-ui/react';
import { useEffect, useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HiOutlineReply, HiOutlineViewGrid } from 'react-icons/hi';
import { TbZoomReset } from "react-icons/tb";
import { FaPalette, FaShapes, FaFont, FaImage, FaEye, FaSave } from 'react-icons/fa';
import { MdTransform } from 'react-icons/md';
import { EDITING_TOOLBAR_CONFIG, GRID_AND_SNAP_SETTINGS } from '~/consts/ui';
import { KeyType } from '~/consts/keys';
import useStageResize from '~/hooks/use-stage-resize';
import { StageObjectType } from '~/types/stage-object';
import Konva from 'konva';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { useAppContext } from '~/context/AppContext';
import { useEditing } from '~/hooks/use-editing';

// Enhanced editing components
import UniversalTransformControls from './UniversalControls/TransformControls';
import UniversalColorControls from './UniversalControls/ColorControls';
import UniversalEffectsControls from './UniversalControls/EffectsControls';
import UniversalTextControls from './UniversalControls/UniversalTextControls';
import UniversalImageControls from './UniversalControls/ImageControls';
import UniversalShapeControls from './UniversalControls/ShapeControls';

interface EditingToolbarProps {
  stageRef?: React.RefObject<Konva.Stage | null> | null;
}

const EditingToolbar = ({ stageRef }: EditingToolbarProps) => {
  const {
    undo,
    redo,
    getHistoryStatus,
    gridSettings,
    toggleGrid
  } = useCanvasContexts();
  
  const {
    isEditing,
    selectedObjectType,
    editingData,
    activeEditingPanel,
    isDirty,
    availableFeatures,
    setPanel,
    applyChanges,
    revert,
    undo: undoEdit,
    redo: redoEdit,
  } = useEditing();

  const GridSettings = gridSettings || { ...GRID_AND_SNAP_SETTINGS };
  const { activeUnitId, activeElevationId, activeView, setActiveView } = useAppContext();
  const { resetZoom } = useStageResize({ stageRef });

  // Track operations to prevent saving during undo/redo
  const isUndoRedoOperationRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Get current history status
  const historyStatus = getHistoryStatus();

  const handleUndo = useCallback(() => {
    isUndoRedoOperationRef.current = true;
    undo();
    setTimeout(() => {
      isUndoRedoOperationRef.current = false;
    }, 100);
  }, [undo]);

  const handleRedo = useCallback(() => {
    isUndoRedoOperationRef.current = true;
    redo();
    setTimeout(() => {
      isUndoRedoOperationRef.current = false;
    }, 100);
  }, [redo]);

  // Hotkeys
  useHotkeys(KeyType.UNDO, (e) => {
    e.preventDefault();
    if (isEditing && editingData) {
      undoEdit();
    } else if (historyStatus.canUndo) {
      handleUndo();
    }
  }, {
    enabled: isEditing ? true : historyStatus.canUndo
  });

  useHotkeys(KeyType.REDO, (e) => {
    e.preventDefault();
    if (isEditing && editingData) {
      redoEdit();
    } else if (historyStatus.canRedo) {
      handleRedo();
    }
  }, {
    enabled: isEditing ? true : historyStatus.canRedo
  });

  useHotkeys(KeyType.GRID, (e) => {
    e.preventDefault();
    toggleGrid();
  }, {
    enabled: true
  });

  // Auto-save shortcut
  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
    if (isEditing && isDirty) {
      applyChanges();
    }
  }, {
    enabled: isEditing && isDirty
  });

  // Get editing panel tabs based on object type
  const getEditingTabs = useCallback(() => {
    if (!isEditing || !selectedObjectType || !availableFeatures) return [];

    const tabs = [];

    // Transform (always available)
    if (availableFeatures.transform) {
      tabs.push({
        id: 'transform',
        label: 'Transform',
        icon: MdTransform,
        color: 'blue'
      });
    }

    // Color & Fill
    if (availableFeatures.fill) {
      tabs.push({
        id: 'color',
        label: 'Color',
        icon: FaPalette,
        color: 'pink'
      });
    }

    // Shape-specific controls
    if (availableFeatures.shapeSpecific) {
      tabs.push({
        id: 'shape',
        label: 'Shape',
        icon: FaShapes,
        color: 'purple'
      });
    }

    // Text controls
    if (availableFeatures.textProperties) {
      tabs.push({
        id: 'text',
        label: 'Text',
        icon: FaFont,
        color: 'green'
      });
    }

    // Image controls
    if (availableFeatures.imageFilters) {
      tabs.push({
        id: 'image',
        label: 'Image',
        icon: FaImage,
        color: 'orange'
      });
    }

    // Effects (shadows, etc.)
    if (availableFeatures.shadow) {
      tabs.push({
        id: 'effects',
        label: 'Effects',
        icon: FaEye,
        color: 'teal'
      });
    }

    return tabs;
  }, [isEditing, selectedObjectType, availableFeatures]);

  const renderEditingControls = useCallback(() => {
    if (!isEditing || !selectedObjectType || !editingData) {
      return null;
    }

    switch (activeEditingPanel) {
      case 'transform':
        return <UniversalTransformControls />;
      case 'color':
        return <UniversalColorControls />;
      case 'effects':
        return <UniversalEffectsControls />;
      case 'shape':
        return <UniversalShapeControls />;
      case 'text':
        return <UniversalTextControls />;
      case 'image':
        return <UniversalImageControls />;
      default:
        // Default to transform
        return <UniversalTransformControls />;
    }
  }, [isEditing, selectedObjectType, editingData, activeEditingPanel]);

  const handleViewChange = (index: number) => {
    if (!activeUnitId || !activeElevationId) return;
    const newView = index === 0 ? 'external' : 'internal';
    setActiveView(newView);
  };

  const currentTabIndex = activeView === 'external' ? 0 : 1;
  const editingTabs = getEditingTabs();

  return (
    <VStack spacing={0} w="100%">
      {/* Main Toolbar */}
      <HStack
        h={`${EDITING_TOOLBAR_CONFIG.height}px`}
        id="editing_toolbar"
        spacing={2}
        sx={{ px: 4 }}
        bgColor="white"
        align="center"
        w="100%"
      >
        {/* Canvas History Controls */}
        <HStack spacing={2}>
          <Tooltip
            hasArrow
            label={`Canvas Undo (${historyStatus.pastCount} actions) - Ctrl + Z`}
            placement="bottom"
            openDelay={500}
          >
            <div style={{ position: 'relative' }}>
              <IconButton
                aria-label="Canvas Undo"
                icon={<Icon as={HiOutlineReply} boxSize={5} />}
                onClick={handleUndo}
                size="sm"
                colorScheme={historyStatus.canUndo ? "blue" : "gray"}
                variant="outline"
                isDisabled={!historyStatus.canUndo}
              />
              {historyStatus.pastCount > 0 && (
                <Badge
                  position="absolute"
                  top="-2"
                  right="-2"
                  borderRadius="full"
                  fontSize="xs"
                  colorScheme="blue"
                  variant="solid"
                  minW="16px"
                  h="16px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {historyStatus.pastCount > 99 ? '99+' : historyStatus.pastCount}
                </Badge>
              )}
            </div>
          </Tooltip>

          <Tooltip
            hasArrow
            label={`Canvas Redo (${historyStatus.futureCount} actions) - Ctrl + Y`}
            placement="bottom"
            openDelay={500}
          >
            <div style={{ position: 'relative' }}>
              <IconButton
                aria-label="Canvas Redo"
                icon={<Icon as={HiOutlineReply} transform="scaleX(-1)" boxSize={5} />}
                onClick={handleRedo}
                size="sm"
                colorScheme={historyStatus.canRedo ? "green" : "gray"}
                variant="outline"
                isDisabled={!historyStatus.canRedo}
              />
              {historyStatus.futureCount > 0 && (
                <Badge
                  position="absolute"
                  top="-2"
                  right="-2"
                  borderRadius="full"
                  fontSize="xs"
                  colorScheme="green"
                  variant="solid"
                  minW="16px"
                  h="16px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {historyStatus.futureCount > 99 ? '99+' : historyStatus.futureCount}
                </Badge>
              )}
            </div>
          </Tooltip>

          <Tooltip hasArrow label="Reset zoom" placement="bottom" openDelay={500}>
            <IconButton
              aria-label="Reset zoom"
              icon={<Icon as={TbZoomReset} boxSize={5} />}
              onClick={resetZoom}
              size="sm"
              colorScheme="gray"
              variant="outline"
            />
          </Tooltip>

          <Tooltip
            hasArrow
            label={`Toggle Grid (${GridSettings.showGrid ? 'Hide' : 'Show'}) - Ctrl + G`}
            placement="bottom"
            openDelay={500}
          >
            <IconButton
              aria-label="Toggle grid"
              icon={<Icon as={HiOutlineViewGrid} boxSize={5} />}
              onClick={toggleGrid}
              size="sm"
              colorScheme={GridSettings.showGrid ? "pink" : "gray"}
              variant="outline"
            />
          </Tooltip>
        </HStack>

        {/* Editing Status & Controls */}
        {isEditing && (
          <HStack spacing={2} bg="pink.50" px={3} py={1} borderRadius="md" border="1px solid" borderColor="pink.200">
            <Badge colorScheme="pink" variant="solid">
              Editing {selectedObjectType}
            </Badge>
            
            {isDirty && (
              <Badge colorScheme="orange" variant="outline">
                Unsaved
              </Badge>
            )}

            <Button
              size="xs"
              leftIcon={<Icon as={FaSave} />}
              colorScheme="green"
              variant="solid"
              onClick={applyChanges}
              isDisabled={!isDirty}
            >
              Save
            </Button>

            <Button
              size="xs"
              colorScheme="gray"
              variant="outline"
              onClick={revert}
              isDisabled={!isDirty}
            >
              Revert
            </Button>
          </HStack>
        )}

        <Spacer />

        {/* View Tabs - Centered */}
        {EDITING_TOOLBAR_CONFIG.showViewToggle && (
          <Tabs
            size="sm"
            colorScheme="pink"
            isFitted
            index={currentTabIndex}
            onChange={handleViewChange}
          >
            <TabList>
              <Tab whiteSpace="nowrap" px="4">External View</Tab>
              <Tab whiteSpace="nowrap" px="4">Internal View</Tab>
            </TabList>
            <TabIndicator mt='-1.5px' height='2px' bg='pink.500' borderRadius='1px' />
          </Tabs>
        )}

        <Spacer />
      </HStack>

      {/* Editing Panel Tabs */}
      {isEditing && editingTabs.length > 0 && (
        <HStack
          w="100%"
          bg="gray.50"
          borderTop="1px solid"
          borderColor="gray.200"
          px={4}
          py={2}
          spacing={1}
        >
          {editingTabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              leftIcon={<Icon as={tab.icon} />}
              colorScheme={activeEditingPanel === tab.id ? tab.color : 'gray'}
              variant={activeEditingPanel === tab.id ? 'solid' : 'ghost'}
              onClick={() => setPanel(tab.id as any)}
            >
              {tab.label}
            </Button>
          ))}

          <Spacer />

          {/* Editing History Controls */}
          <HStack spacing={1}>
            <Tooltip label="Undo Edit (Ctrl+Z)" placement="bottom">
              <IconButton
                aria-label="Undo edit"
                icon={<Icon as={HiOutlineReply} boxSize={4} />}
                size="sm"
                variant="ghost"
                onClick={undoEdit}
                isDisabled={!editingData}
              />
            </Tooltip>

            <Tooltip label="Redo Edit (Ctrl+Y)" placement="bottom">
              <IconButton
                aria-label="Redo edit"
                icon={<Icon as={HiOutlineReply} transform="scaleX(-1)" boxSize={4} />}
                size="sm"
                variant="ghost"
                onClick={redoEdit}
                isDisabled={!editingData}
              />
            </Tooltip>
          </HStack>
        </HStack>
      )}

      {/* Active Editing Controls */}
      {isEditing && (
        <HStack
          w="100%"
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          px={4}
          py={3}
          minH="60px"
          align="center"
          justify="flex-start"
          overflowX="auto"
        >
          {renderEditingControls()}
        </HStack>
      )}
    </VStack>
  );
};

export default EditingToolbar;