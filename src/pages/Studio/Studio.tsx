import { Flex, Center, Box } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import Konva from 'konva';
import Frame from './Frame';
import Navbar from './Navbar/Navbar';
import Toolbar from './Toolbar';
import EditingToolbar from './EditingToolbar/EditingToolbar';
import BottomTabs from './BottomTabs/BottomTabs';
import RightSidebar from '~/components/RightSidebar/RightSidebar';
import RightSidebarPanel from '~/components/RightSidebar/RightSidebarPanel';
import { useRightSidebar } from '~/hooks/use-right-sidebar';
import { useHotkeys } from 'react-hotkeys-hook';
import useStageResize from '~/hooks/use-stage-resize';
import {
  NAVBAR_HEIGHT,
  EDITING_TOOLBAR_HEIGHT,
  FRAME_CONTAINER_PADDING,
  BOTTOM_TABS_HEIGHT
} from '~/consts/components';
import { DragProvider } from '~/hooks/use-drag-context';

const Studio = () => {
  // Create stageRef at Studio level
  const stageRef = React.useRef<Konva.Stage>(null);

  // Lasso mode state
  const [isLassoMode, setIsLassoMode] = useState(false);
  const [, setIsTouchDevice] = useState(false);


  // Right sidebar state from Redux
  const { isOpen: isRightSidebarOpen, sidebarWidth } = useRightSidebar();

  // Get stage resize functions
  const { resetZoom, fitToCanvas, zoomIn, zoomOut } = useStageResize({ stageRef });

  // Layout dimensions state
  const [navbarHeight, setNavbarHeight] = useState(NAVBAR_HEIGHT);
  const [, setEditingToolbarHeight] = useState(EDITING_TOOLBAR_HEIGHT);
  const [, setBottomTabsHeight] = useState(BOTTOM_TABS_HEIGHT);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Zoom hotkeys
  useHotkeys('ctrl+=', (e) => {
    e.preventDefault();
    zoomIn();
  });

  useHotkeys('ctrl+-', (e) => {
    e.preventDefault();
    zoomOut();
  });

  useHotkeys('ctrl+0', (e) => {
    e.preventDefault();
    resetZoom();
  });

  useHotkeys('ctrl+shift+0', (e) => {
    e.preventDefault();
    fitToCanvas();
  });

  // Layout detection effects
  useEffect(() => {
    const navbar = document.querySelector('#navbar') as HTMLElement;
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const editingToolbar = document.querySelector('#editing_toolbar') as HTMLElement;
    if (editingToolbar) {
      setEditingToolbarHeight(editingToolbar.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const bottomTabs = document.querySelector('#bottom_tabs') as HTMLElement;
    if (bottomTabs) {
      setBottomTabsHeight(bottomTabs.offsetHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setBottomTabsHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(bottomTabs);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <DragProvider>
      <Box
        maxH="100vh"
        overflow="hidden"
        position="relative"
        display="flex"
        flexDirection="column"
      >
        {/* Fixed Navbar */}
        <Box position="relative" zIndex="20">
          <Navbar />
        </Box>

        {/* Main Content Area */}
        <Flex
          h={`calc(100vh - ${navbarHeight}px)`}
          w="100%"
          overflow="hidden"
          position="relative"
        >
          {/* Left Toolbar - Fixed */}
          <Box
            position="relative"
            zIndex="15"
            flexShrink={0}
          >
            <Toolbar />
          </Box>

          {/* Main Canvas Area - Flexible */}
          <Box
            flex="1"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            position="relative"
            transition="margin-right 0.3s ease"
            marginRight={isRightSidebarOpen ? `${sidebarWidth}px` : '0'}
          >
            {/* Enhanced EditingToolbar with Lasso */}
            <Box position="relative" zIndex="10">
              <EditingToolbar
                stageRef={stageRef}
              />
            </Box>

            {/* Canvas Container */}
            <Box
              flex="1"
              position="relative"
              overflow="hidden"
            >
              <Center
                className="canvas-container"
                h="100%"
                w="100%"
                bgColor="gray.200"
                padding={`${FRAME_CONTAINER_PADDING}px`}
                position="relative"
              >
                <Frame
                  stageRef={stageRef}
                  isLassoMode={isLassoMode}
                  onToggleLassoMode={() => setIsLassoMode(!isLassoMode)}
                />
              </Center>
            </Box>

            {/* Bottom Tabs */}
            <Box position="relative" zIndex="10">
              <BottomTabs />
            </Box>
          </Box>
        </Flex>

        {/* Right Sidebar - Collapsed Tabs */}
        <Box zIndex="20">
          <RightSidebar />
        </Box>

        {/* Right Sidebar Panel - Resizable */}
        <Box zIndex="25">
          <RightSidebarPanel />
        </Box>
      </Box>
    </DragProvider>

  );
};

export default Studio;