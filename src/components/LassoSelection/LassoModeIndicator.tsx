// File: src/components/LassoSelection/LassoModeIndicator.tsx - ENHANCED

import React from 'react';
import { 
  Box, 
  HStack, 
  Icon, 
  Badge, 
  Text,
  Flex,
  useToast,
  ScaleFade,
  Slide
} from '@chakra-ui/react';
import { RiSeoLine } from 'react-icons/ri';
import { HiOutlineDeviceMobile, HiOutlineDesktopComputer, HiLockClosed } from 'react-icons/hi';
import { useEffect } from 'react';

interface LassoModeIndicatorProps {
  isLassoMode: boolean;
  isDrawing: boolean;
  selectedCount: number;
  previewCount: number;
  lockedCount: number;
  isTouch: boolean;
  canMoveObjects: boolean;
}

const LassoModeIndicator: React.FC<LassoModeIndicatorProps> = ({
  isLassoMode,
  isDrawing,
  previewCount,
  lockedCount,
  isTouch,
  canMoveObjects,
}) => {
  const toast = useToast();

  // Show toast when lasso mode is activated
  useEffect(() => {
    if (isLassoMode) {
      toast({
        title: "🎯 Lasso Selection Active",
        description: isTouch 
          ? "Draw with your finger to select objects. Other objects are locked." 
          : "Draw with mouse to select objects. Other objects are locked.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  }, [isLassoMode, isTouch, toast]);

  // Show toast when objects are locked in selection
  useEffect(() => {
    if (lockedCount > 0 && !isDrawing) {
      toast({
        title: `🔒 ${lockedCount} Object${lockedCount > 1 ? 's' : ''} Selected`,
        description: "Only selected objects can be moved. Toggle lasso off to move others.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  }, [lockedCount, isDrawing, toast]);

  if (!isLassoMode) return null;

  return (
    <>
      {/* Main Lasso Indicator */}
      <ScaleFade initialScale={0.8} in={isLassoMode}>
        <Box
          position="absolute"
          top="4"
          left="50%"
          transform="translateX(-50%)"
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          boxShadow="lg"
          border="2px solid"
          borderColor="pink.300"
          p="4"
          zIndex="30"
          pointerEvents="none"
          minW="280px"
        >
          <Flex direction="column" align="center" gap="2">
            {/* Header */}
            <HStack spacing="3">
              <Icon 
                as={RiSeoLine} 
                boxSize="6" 
                color="pink.500"
                style={{
                  animation: isDrawing ? 'pulse 1.5s infinite' : 'none'
                }}
              />
              
              <Icon 
                as={isTouch ? HiOutlineDeviceMobile : HiOutlineDesktopComputer} 
                boxSize="4" 
                color="gray.500"
              />

              <Text fontSize="md" fontWeight="bold" color="pink.600">
                Lasso Selection
              </Text>
            </HStack>

            {/* Status Badges */}
            <HStack spacing="2">
              {isDrawing && (
                <Badge colorScheme="pink" variant="solid" borderRadius="full" fontSize="xs">
                  Drawing...
                </Badge>
              )}

              {previewCount > 0 && isDrawing && (
                <Badge colorScheme="blue" variant="subtle" borderRadius="full" fontSize="xs">
                  {previewCount} preview
                </Badge>
              )}

              {lockedCount > 0 && !isDrawing && (
                <Badge colorScheme="green" variant="solid" borderRadius="full" fontSize="xs">
                  <HStack spacing="1">
                    <Icon as={HiLockClosed} boxSize="3" />
                    <Text>{lockedCount} locked</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>

            {/* Instructions */}
            <Text fontSize="xs" color="gray.600" textAlign="center" maxW="260px">
              {isDrawing 
                ? (isTouch ? "Keep drawing to select objects..." : "Keep drawing to select objects...")
                : lockedCount > 0
                  ? "Selection locked. Toggle lasso off to move other objects."
                  : isTouch 
                    ? "Draw around objects with your finger"
                    : "Draw around objects with your mouse • Press L or ESC to exit"
              }
            </Text>
          </Flex>
        </Box>
      </ScaleFade>

      {/* Lock Warning for Non-Selected Objects */}
      {isLassoMode && !canMoveObjects && lockedCount === 0 && (
        <Slide direction="bottom" in={true} style={{ zIndex: 25 }}>
          <Box
            position="fixed"
            bottom="4"
            left="50%"
            transform="translateX(-50%)"
            bg="orange.100"
            border="1px solid"
            borderColor="orange.300"
            borderRadius="lg"
            p="3"
            maxW="400px"
          >
            <HStack spacing="2">
              <Icon as={HiLockClosed} color="orange.600" boxSize="4" />
              <Text fontSize="sm" color="orange.800" fontWeight="medium">
                Objects are locked in lasso mode. Draw to select or toggle off.
              </Text>
            </HStack>
          </Box>
        </Slide>
      )}
    </>
  );
};

export default LassoModeIndicator;