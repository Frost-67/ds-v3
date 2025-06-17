
import { HStack, Icon, IconButton, Spacer, TabIndicator, Tooltip, Badge } from '@chakra-ui/react';
import { useEffect, useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HiOutlineReply, HiOutlineViewGrid } from 'react-icons/hi';
import { EDITING_TOOLBAR_CONFIG, GRID_AND_SNAP_SETTINGS } from '~/consts/ui';
import { KeyType } from '~/consts/keys';
import useStageResize from '~/hooks/use-stage-resize';
import { StageObjectType } from '~/types/stage-object';
import ImageEditing from './ImageEditing/ImageEditing';
import ShapesEditing from './ShapesEditing/ShapesEditing';
import TextEditing from './TextEditing/TextEditing';
import { Tabs, TabList, Tab } from '@chakra-ui/react';
import { TbZoomReset } from "react-icons/tb";
import Konva from 'konva';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { useAppContext } from '~/context/AppContext';

interface EditingToolbarProps {
  stageRef?: React.RefObject<Konva.Stage | null> | null;
}

const EditingToolbar = ({ stageRef }: EditingToolbarProps) => {
  const {
    objects: stageObjects,
    selected,
    undo,
    redo,
    getHistoryStatus,
    gridSettings,
    toggleGrid
  } = useCanvasContexts();
  const GridSettings = gridSettings || { ...GRID_AND_SNAP_SETTINGS };
  const { activeUnitId, activeElevationId, activeView, setActiveView } = useAppContext();
  const { resetZoom } = useStageResize({ stageRef });

  // Track operations to prevent saving during undo/redo AND after JSON load
  const isUndoRedoOperationRef = useRef(false);
  const isInitialLoadRef = useRef(true); //  Track if this is initial load

  //  Get current history status
  const historyStatus = getHistoryStatus();

  const handleUndo = useCallback(() => {
    isUndoRedoOperationRef.current = true;
    undo();

    // Reset flag after operation
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

  //  Reset initial load flag when context changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    console.log(`🔄 Context changed - marking as initial load`);
  }, [historyStatus.contextId]);

  //  Mark as no longer initial load after first user action
  useEffect(() => {
    if (isInitialLoadRef.current && stageObjects.length > 0 && historyStatus.pastCount > 0) {
      isInitialLoadRef.current = false;
      console.log(`👤 User action detected - no longer initial load`);
    }
  }, [stageObjects.length, historyStatus.pastCount]);

  //  Hotkeys with proper context awareness
  useHotkeys(KeyType.UNDO, (e) => {
    e.preventDefault();
    if (historyStatus.canUndo) {
      handleUndo();
    }
  }, {
    enabled: historyStatus.canUndo
  });

  useHotkeys(KeyType.REDO, (e) => {
    e.preventDefault();
    if (historyStatus.canRedo) {
      handleRedo();
    }
  }, {
    enabled: historyStatus.canRedo
  });
  useHotkeys(KeyType.GRID, (e) => {
    e.preventDefault();
    toggleGrid();
  }, {
    enabled: true
  });
  const getSelectedObject = () => {
    if (selected.length === 1 && stageObjects) {
      return stageObjects.find((obj) => obj.id === selected[0]);
    }
    return null;
  };

  const selectedObject = getSelectedObject();

  const renderEditing = () => {
    switch (selectedObject?.data.type) {
      case StageObjectType.IMAGE:
        return <ImageEditing selectedObject={selectedObject} />;
      case StageObjectType.SHAPE:
        return <ShapesEditing selectedObject={selectedObject} />;
      case StageObjectType.TEXT:
        return <TextEditing selectedObject={selectedObject} />;
      default:
        return null;
    }
  };

  const handleViewChange = (index: number) => {
    if (!activeUnitId || !activeElevationId) return;

    const newView = index === 0 ? 'external' : 'internal';
    setActiveView(newView);
  };

  const currentTabIndex = activeView === 'external' ? 0 : 1;

  return (
    <HStack
      h={`${EDITING_TOOLBAR_CONFIG.height}px`}
      id="editing_toolbar"
      spacing={2}
      sx={{ px: 4 }}
      bgColor="white"
      align="center"
    >
      {/*  Context-aware Undo/Redo with status indicators */}
      <HStack spacing={2}>
        <Tooltip
          hasArrow
          label={`Undo (${historyStatus.pastCount} actions) - Ctrl + Z`}
          placement="bottom"
          openDelay={500}
        >
          <div style={{ position: 'relative' }}>
            <IconButton
              aria-label="Undo"
              icon={<Icon as={HiOutlineReply} boxSize={5} />}
              onClick={handleUndo}
              size="sm"
              colorScheme={historyStatus.canUndo ? "blue" : "gray"}
              variant="outline"
              isDisabled={!historyStatus.canUndo}
            />
            {/* Show past count as badge */}
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
          label={`Redo (${historyStatus.futureCount} actions) - Ctrl + Y`}
          placement="bottom"
          openDelay={500}
        >
          <div style={{ position: 'relative' }}>
            <IconButton
              aria-label="Redo"
              icon={<Icon as={HiOutlineReply} transform="scaleX(-1)" boxSize={5} />}
              onClick={handleRedo}
              size="sm"
              colorScheme={historyStatus.canRedo ? "green" : "gray"}
              variant="outline"
              isDisabled={!historyStatus.canRedo}
            />
            {/* Show future count as badge */}
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



      {/* Editing Controls */}
      {renderEditing()}

      {/* View Tabs - Centered */}
      <Spacer />
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
  );
};

export default EditingToolbar;