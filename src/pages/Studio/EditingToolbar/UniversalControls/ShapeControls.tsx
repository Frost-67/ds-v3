import {
  HStack,
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useEditing } from '~/hooks/use-editing';

const UniversalShapeControls = () => {
  const { editingData, updateShape } = useEditing();

  if (!editingData) return null;

  const handleCornerRadius = useCallback((radius: number) => {
    updateShape({ cornerRadius: radius });
  }, [updateShape]);

  const handleStarProperties = useCallback((property: string, value: number) => {
    updateShape({ [property]: value });
  }, [updateShape]);

  const handleArrowProperties = useCallback((property: string, value: number | boolean) => {
    updateShape({ [property]: value });
  }, [updateShape]);

  const isRect = editingData.shapeType === 'rect';
  const isStar = editingData.shapeType === 'star';
  const isArrow = editingData.shapeType === 'arrow';
  const isPolygon = editingData.shapeType === 'polygon';

  return (
    <HStack spacing={6} wrap="wrap" align="flex-start">
      {/* Rectangle Controls */}
      {isRect && (
        <VStack align="flex-start" spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Rectangle
          </Text>
          
          <FormControl>
            <FormLabel fontSize="sm">Corner Radius</FormLabel>
            <HStack>
              <Slider
                value={typeof editingData.cornerRadius === 'number' ? editingData.cornerRadius : 0}
                onChange={handleCornerRadius}
                min={0}
                max={Math.min(editingData.width, editingData.height) / 2}
                colorScheme="pink"
                w="120px"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <NumberInput
                value={typeof editingData.cornerRadius === 'number' ? editingData.cornerRadius : 0}
                onChange={(_, val) => !isNaN(val) && handleCornerRadius(val)}
                size="sm"
                w="80px"
                min={0}
                max={Math.min(editingData.width, editingData.height) / 2}
              >
                <NumberInputField />
              </NumberInput>
            </HStack>
          </FormControl>
        </VStack>
      )}

      {/* Star Controls */}
      {isStar && (
        <VStack align="flex-start" spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Star
          </Text>
          
          <FormControl>
            <FormLabel fontSize="xs">Points</FormLabel>
            <NumberInput
              value={editingData.numPoints || 5}
              onChange={(_, val) => !isNaN(val) && handleStarProperties('numPoints', val)}
              size="sm"
              min={3}
              max={20}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Inner Radius</FormLabel>
            <NumberInput
              value={editingData.innerRadius || 20}
              onChange={(_, val) => !isNaN(val) && handleStarProperties('innerRadius', val)}
              size="sm"
              min={1}
              max={200}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Outer Radius</FormLabel>
            <NumberInput
              value={editingData.outerRadius || 50}
              onChange={(_, val) => !isNaN(val) && handleStarProperties('outerRadius', val)}
              size="sm"
              min={1}
              max={200}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>
      )}

      {/* Arrow Controls */}
      {isArrow && (
        <VStack align="flex-start" spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Arrow
          </Text>
          
          <FormControl>
            <FormLabel fontSize="xs">Pointer Length</FormLabel>
            <NumberInput
              value={editingData.pointerLength || 15}
              onChange={(_, val) => !isNaN(val) && handleArrowProperties('pointerLength', val)}
              size="sm"
              min={5}
              max={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Pointer Width</FormLabel>
            <NumberInput
              value={editingData.pointerWidth || 15}
              onChange={(_, val) => !isNaN(val) && handleArrowProperties('pointerWidth', val)}
              size="sm"
              min={5}
              max={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel fontSize="xs" mb={0}>Pointer at Start</FormLabel>
            <Switch
              isChecked={editingData.pointerAtBeginning || false}
              onChange={(e) => handleArrowProperties('pointerAtBeginning', e.target.checked)}
              colorScheme="pink"
              size="sm"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel fontSize="xs" mb={0}>Pointer at End</FormLabel>
            <Switch
              isChecked={editingData.pointerAtEnding || false}
              onChange={(e) => handleArrowProperties('pointerAtEnding', e.target.checked)}
              colorScheme="pink"
              size="sm"
            />
          </FormControl>
        </VStack>
      )}

      {/* Polygon Controls */}
      {isPolygon && (
        <VStack align="flex-start" spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Polygon
          </Text>
          
          <FormControl>
            <FormLabel fontSize="xs">Sides</FormLabel>
            <NumberInput
              value={editingData.sides || 6}
              onChange={(_, val) => !isNaN(val) && handleStarProperties('sides', val)}
              size="sm"
              min={3}
              max={20}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>
      )}
    </HStack>
  );
};

export default UniversalShapeControls;