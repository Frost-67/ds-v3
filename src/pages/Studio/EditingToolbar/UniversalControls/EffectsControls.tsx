import {
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  Text,
  Divider,
} from '@chakra-ui/react';
import { SketchPicker, ColorResult } from 'react-color';
import { useCallback } from 'react';
import { useEditing } from '~/hooks/use-editing';
import { getRGBAString } from '~/utils/get-rgba-string';

const UniversalEffectsControls = () => {
  const { editingData, updateShadow } = useEditing();

  if (!editingData) return null;

  const handleShadowToggle = useCallback((enabled: boolean) => {
    updateShadow({ shadowEnabled: enabled });
  }, [updateShadow]);

  const handleShadowColorChange = useCallback((color: ColorResult) => {
    const rgbaColor = getRGBAString(color.rgb);
    updateShadow({ shadowColor: rgbaColor });
  }, [updateShadow]);

  const handleShadowBlur = useCallback((blur: number) => {
    updateShadow({ shadowBlur: blur });
  }, [updateShadow]);

  const handleShadowOffset = useCallback((axis: 'shadowOffsetX' | 'shadowOffsetY', value: number) => {
    updateShadow({ [axis]: value });
  }, [updateShadow]);

  const handleShadowOpacity = useCallback((opacity: number) => {
    updateShadow({ shadowOpacity: opacity });
  }, [updateShadow]);

  return (
    <HStack spacing={6} wrap="wrap" align="flex-start">
      {/* Shadow Controls */}
      <VStack align="flex-start" spacing={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Drop Shadow
        </Text>
        
        {/* Enable Shadow */}
        <FormControl display="flex" alignItems="center">
          <FormLabel fontSize="sm" mb={0}>Enable Shadow</FormLabel>
          <Switch
            isChecked={editingData.shadowEnabled}
            onChange={(e) => handleShadowToggle(e.target.checked)}
            colorScheme="pink"
          />
        </FormControl>

        {editingData.shadowEnabled && (
          <VStack spacing={4} align="flex-start">
            {/* Shadow Color */}
            <FormControl>
              <FormLabel fontSize="sm">Shadow Color</FormLabel>
              <SketchPicker
                color={editingData.shadowColor}
                onChangeComplete={handleShadowColorChange}
                width="200px"
              />
            </FormControl>

            {/* Shadow Properties */}
            <HStack spacing={4}>
              <VStack align="flex-start">
                <FormControl>
                  <FormLabel fontSize="xs">Blur</FormLabel>
                  <Slider
                    value={editingData.shadowBlur}
                    onChange={handleShadowBlur}
                    min={0}
                    max={50}
                    colorScheme="pink"
                    w="120px"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {editingData.shadowBlur}px
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs">Opacity</FormLabel>
                  <Slider
                    value={editingData.shadowOpacity * 100}
                    onChange={(val) => handleShadowOpacity(val / 100)}
                    min={0}
                    max={100}
                    colorScheme="pink"
                    w="120px"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {Math.round(editingData.shadowOpacity * 100)}%
                  </Text>
                </FormControl>
              </VStack>

              <VStack align="flex-start">
                <FormControl>
                  <FormLabel fontSize="xs">Offset X</FormLabel>
                  <NumberInput
                    value={editingData.shadowOffsetX}
                    onChange={(_, val) => !isNaN(val) && handleShadowOffset('shadowOffsetX', val)}
                    size="sm"
                    w="80px"
                    min={-50}
                    max={50}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs">Offset Y</FormLabel>
                  <NumberInput
                    value={editingData.shadowOffsetY}
                    onChange={(_, val) => !isNaN(val) && handleShadowOffset('shadowOffsetY', val)}
                    size="sm"
                    w="80px"
                    min={-50}
                    max={50}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </VStack>
            </HStack>
          </VStack>
        )}
      </VStack>
    </HStack>
  );
};

export default UniversalEffectsControls;