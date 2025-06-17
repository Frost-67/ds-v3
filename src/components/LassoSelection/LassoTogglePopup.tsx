// File: src/components/LassoSelection/LassoTogglePopup.tsx - SIMPLE

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  HStack, 
  Icon, 
  Text,
  ScaleFade,
} from '@chakra-ui/react';
import { RiSeoLine } from 'react-icons/ri';
import { HiOutlineDeviceMobile, HiOutlineDesktopComputer } from 'react-icons/hi';

interface LassoTogglePopupProps {
  isLassoMode: boolean;
  isTouch: boolean;
  selectedCount: number;
}

const LassoTogglePopup: React.FC<LassoTogglePopupProps> = ({
  isLassoMode,
  isTouch,
  selectedCount,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isLassoMode) {
      setShowPopup(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [isLassoMode]);

  if (!showPopup) return null;

  return (
    <ScaleFade initialScale={0.8} in={showPopup}>
      <Box
        position="absolute"
        top="20px"
        left="50%"
        transform="translateX(-50%)"
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        borderRadius="lg"
        boxShadow="lg"
        border="1px solid"
        borderColor="pink.200"
        p="3"
        zIndex="30"
        pointerEvents="none"
      >
        <HStack spacing="3">
          <Icon 
            as={RiSeoLine} 
            boxSize="5" 
            color="pink.500"
          />
          
          <Icon 
            as={isTouch ? HiOutlineDeviceMobile : HiOutlineDesktopComputer} 
            boxSize="4" 
            color="gray.500"
          />

          <Text fontSize="sm" fontWeight="medium" color="pink.600">
            {selectedCount > 0 
              ? `${selectedCount} objects selected`
              : isTouch 
                ? "Draw around objects" 
                : "Draw around objects"
            }
          </Text>
        </HStack>
      </Box>
    </ScaleFade>
  );
};

export default LassoTogglePopup;