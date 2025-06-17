// src/pages/Studio/EditingToolbar/UniversalControls/TransformControls.tsx
import {
  HStack,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  IconButton,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { FaLock, FaUnlock, FaExpandArrowsAlt, FaCompress } from 'react-icons/fa';
import { MdFlip, MdRotateLeft, MdRotateRight } from 'react-icons/md';
import { useState, useCallback } from 'react';
import { useEditing } from '~/hooks/use-editing';

const UniversalTransformControls = () => {
  const { editingData, updateTransform } = useEditing();
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);

  if (!editingData) return null;

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    updateTransform({ [axis]: value });
  }, [updateTransform]);

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: number) => {
    if (aspectRatioLocked && editingData) {
      const aspectRatio = editingData.width / editingData.height;
      if (dimension === 'width') {
        updateTransform({
          width: value,
          height: value / aspectRatio,
        });
      } else {
        updateTransform({
          width: value * aspectRatio,
          height: value,
        });
      }
    } else {
      updateTransform({ [dimension]: value });
    }
  }, [aspectRatioLocked, editingData, updateTransform]);

  const handleRotationChange = useCallback((rotation: number) => {
    updateTransform({ rotation });
  }, [updateTransform]);

  const handleScaleChange = useCallback((axis: 'scaleX' | 'scaleY', value: number) => {
    if (aspectRatioLocked) {
      updateTransform({
        scaleX: value,
        scaleY: value,
      });
    } else {
      updateTransform({ [axis]: value });
    }
  }, [aspectRatioLocked, updateTransform]);

  const handleFlip = useCallback((axis: 'horizontal' | 'vertical') => {
    if (axis === 'horizontal') {
      updateTransform({ scaleX: editingData.scaleX * -1 });
    } else {
      updateTransform({ scaleY: editingData.scaleY * -1 });
    }
  }, [editingData.scaleX, editingData.scaleY, updateTransform]);

  const handleQuickRotate = useCallback((degrees: number) => {
    const newRotation = (editingData.rotation + degrees) % 360;
    updateTransform({ rotation: newRotation });
  }, [editingData.rotation, updateTransform]);

  const resetTransform = useCallback(() => {
    updateTransform({
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  }, [updateTransform]);

  return (
    <HStack spacing={6} wrap="wrap" align="flex-start">
      {/* Position Controls */}
      <VStack align="flex-start" spacing={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Position
        </Text>
        <HStack spacing={2}>
          <FormControl minW="80px">
            <FormLabel fontSize="xs" mb={1}>X</FormLabel>
            <NumberInput
              value={Math.round(editingData.x)}
              onChange={(_, val) => !isNaN(val) && handlePositionChange('x', val)}
              size="sm"
              min={-9999}
              max={9999}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl minW="80px">
            <FormLabel fontSize="xs" mb={1}>Y</FormLabel>
            <NumberInput
              value={Math.round(editingData.y)}
              onChange={(_, val) => !isNaN(val) && handlePositionChange('y', val)}
              size="sm"
              min={-9999}
              max={9999}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>
      </VStack>

      <Divider orientation="vertical" h="80px" />

      {/* Size Controls */}
      <VStack align="flex-start" spacing={2}>
        <HStack spacing={2} align="center">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Size
          </Text>
          <Tooltip label={aspectRatioLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}>
            <IconButton
              aria-label="Toggle aspect ratio"
              icon={aspectRatioLocked ? <FaLock /> : <FaUnlock />}
              size="xs"
              colorScheme={aspectRatioLocked ? "pink" : "gray"}
              variant="ghost"
              onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            />
          </Tooltip>
        </HStack>
        <HStack spacing={2}>
          <FormControl minW="80px">
            <FormLabel fontSize="xs" mb={1}>W</FormLabel>
            <NumberInput
              value={Math.round(editingData.width)}
              onChange={(_, val) => !isNaN(val) && val > 0 && handleSizeChange('width', val)}
              size="sm"
              min={1}
              max={9999}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl minW="80px">
            <FormLabel fontSize="xs" mb={1}>H</FormLabel>
            <NumberInput
              value={Math.round(editingData.height)}
              onChange={(_, val) => !isNaN(val) && val > 0 && handleSizeChange('height', val)}
              size="sm"
              min={1}
              max={9999}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>
      </VStack>

      <Divider orientation="vertical" h="80px" />

      {/* Rotation Controls */}
      <VStack align="flex-start" spacing={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Rotation
        </Text>
        <HStack spacing={2}>
          <FormControl minW="100px">
            <Slider
              value={editingData.rotation}
              onChange={handleRotationChange}
              min={-180}
              max={180}
              step={1}
              colorScheme="pink"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={4} />
            </Slider>
          </FormControl>
          <NumberInput
            value={Math.round(editingData.rotation)}
            onChange={(_, val) => !isNaN(val) && handleRotationChange(val)}
            size="sm"
            minW="60px"
            min={-180}
            max={180}
          >
            <NumberInputField />
          </NumberInput>
        </HStack>
        <HStack spacing={1}>
          <Tooltip label="Rotate left 90°">
            <IconButton
              aria-label="Rotate left"
              icon={<MdRotateLeft />}
              size="xs"
              onClick={() => handleQuickRotate(-90)}
            />
          </Tooltip>
          <Tooltip label="Rotate right 90°">
            <IconButton
              aria-label="Rotate right"
              icon={<MdRotateRight />}
              size="xs"
              onClick={() => handleQuickRotate(90)}
            />
          </Tooltip>
        </HStack>
      </VStack>

      <Divider orientation="vertical" h="80px" />

      {/* Scale Controls */}
      <VStack align="flex-start" spacing={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Scale
        </Text>
        <HStack spacing={2}>
          <FormControl minW="80px">
            <FormLabel fontSize="xs" mb={1}>X</FormLabel>
            <NumberInput
              value={Number(editingData.scaleX.toFixed(2))}
              onChange={(_, val) => !isNaN(val) && handleScaleChange('scaleX', val)}
              size="sm"
              min={-10}
              max={10}
              step={0.1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl minW="80px">
            <FormLabel fontSize="xs" mb={1}>Y</FormLabel>
            <NumberInput
              value={Number(editingData.scaleY.toFixed(2))}
              onChange={(_, val) => !isNaN(val) && handleScaleChange('scaleY', val)}
              size="sm"
              min={-10}
              max={10}
              step={0.1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>
      </VStack>

      <Divider orientation="vertical" h="80px" />

      {/* Flip & Reset Controls */}
      <VStack align="flex-start" spacing={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Actions
        </Text>
        <HStack spacing={2}>
          <VStack spacing={1}>
            <Tooltip label="Flip horizontal">
              <IconButton
                aria-label="Flip horizontal"
                icon={<MdFlip />}
                size="sm"
                onClick={() => handleFlip('horizontal')}
              />
            </Tooltip>
            <Tooltip label="Flip vertical">
              <IconButton
                aria-label="Flip vertical"
                icon={<MdFlip style={{ transform: 'rotate(90deg)' }} />}
                size="sm"
                onClick={() => handleFlip('vertical')}
              />
            </Tooltip>
          </VStack>
          
          <VStack spacing={1}>
            <Tooltip label="Reset transform">
              <IconButton
                aria-label="Reset transform"
                icon={<FaCompress />}
                size="sm"
                colorScheme="gray"
                onClick={resetTransform}
              />
            </Tooltip>
          </VStack>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default UniversalTransformControls;