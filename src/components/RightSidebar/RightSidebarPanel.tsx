import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { HiX } from 'react-icons/hi';
import { useRightSidebar } from '~/hooks/use-right-sidebar';
import ThreeDOverviewTab from './Tabs/3DOverviewTab';
import QuestionnaireTab from './Tabs/QuestionnaireTab';
import ProjectInfoTab from './Tabs/ProjectInfoTab';

const RightSidebarPanel: React.FC = () => {
  const {
    activeTab,
    isOpen,
    sidebarWidth,
    minWidth,
    maxWidth,
    isResizing,
    closeTab,
    setSidebarWidth,
    setResizing,
  } = useRightSidebar();

  const [startXRef] = useState({ current: 0 });
  const [startWidthRef] = useState({ current: 0 });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');


  // Get tab title and content
  const getTabInfo = () => {
    switch (activeTab) {
      case '3d-overview':
        return { title: '3D Overview', content: <ThreeDOverviewTab /> };
      case 'questionnaire':
        return { title: 'Questionnaire', content: <QuestionnaireTab /> };
      case 'project-info':
        return { title: 'Project Info', content: <ProjectInfoTab /> };
      default:
        return { title: '', content: null };
    }
  };

  // Mouse events for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = startXRef.current - e.clientX;
    const newWidth = startWidthRef.current + deltaX;
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

    setSidebarWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Set up global mouse events
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, sidebarWidth, minWidth, maxWidth, setSidebarWidth, setResizing]);

  if (!isOpen || !activeTab) {
    return null;
  }

  const { title, content } = getTabInfo();

  return (
    <Box
      position="fixed"
      top="75px"
      right="0"
      bottom="0"
      width={`${sidebarWidth}px`}
      bg={bgColor}
      borderLeft="2px solid"
      borderColor={borderColor}
      boxShadow="xl"
      zIndex="25" // Higher than right sidebar buttons (15)
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Resize Handle */}
      <Box
        position="absolute"
        left="-6px"
        top="0"
        bottom="0"
        width="12px"
        bg="transparent"
        cursor="col-resize"
        onMouseDown={handleMouseDown}
        zIndex="25"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          '& > .resize-handle': {
            bg: 'pink.400',
          }
        }}
      >
        <Box
          className="resize-handle"
          width="4px"
          height="40px"
          bg="gray.300"
          borderRadius="full"
          transition="background-color 0.2s"
        />
      </Box>

      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        p="4"
        borderBottom="1px solid"
        borderColor={borderColor}
        flexShrink={0}
      >
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>

        <IconButton
          aria-label="Close"
          icon={<HiX />}
          size="sm"
          variant="ghost"
          onClick={closeTab}
        />
      </Flex>

      {/* Content */}
      <Box flex="1" overflow="hidden">
        <Box h="100%" overflowY="auto" overflowX="hidden" p="4">
          {content}
        </Box>
      </Box>

      {/* Resize Indicator */}
      {isResizing && (
        <Box
          position="absolute"
          bottom="4"
          left="4"
          bg="pink.500"
          color="white"
          px="3"
          py="1"
          borderRadius="md"
          fontSize="sm"
          fontWeight="semibold"
          zIndex="30"
          pointerEvents="none"
        >
          {Math.round(sidebarWidth)}px
        </Box>
      )}
    </Box>
  );
};

export default RightSidebarPanel;