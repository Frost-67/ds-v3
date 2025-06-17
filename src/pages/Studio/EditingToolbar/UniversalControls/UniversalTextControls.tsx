// src/pages/Studio/EditingToolbar/UniversalControls/TextControls.tsx
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
  Select,
  Button,
  ButtonGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useEditing } from '~/hooks/use-editing';

const UniversalTextControls = () => {
  const { editingData, updateText } = useEditing();

  if (!editingData) return null;

  const handleTextChange = useCallback((text: string) => {
    updateText({ text });
  }, [updateText]);

  const handleFontSizeChange = useCallback((fontSize: number) => {
    updateText({ fontSize });
  }, [updateText]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    updateText({ fontFamily });
  }, [updateText]);

  const handleAlignChange = useCallback((align: string) => {
    updateText({ align: align as any });
  }, [updateText]);

  const handleStyleToggle = useCallback((style: 'bold' | 'italic') => {
    const currentStyle = editingData.fontStyle || 'normal';
    let newStyle = currentStyle;

    if (style === 'bold') {
      if (currentStyle.includes('bold')) {
        newStyle = currentStyle.replace('bold', '').trim() || 'normal';
      } else {
        newStyle = currentStyle === 'normal' ? 'bold' : `${currentStyle} bold`;
      }
    } else if (style === 'italic') {
      if (currentStyle.includes('italic')) {
        newStyle = currentStyle.replace('italic', '').trim() || 'normal';
      } else {
        newStyle = currentStyle === 'normal' ? 'italic' : `italic ${currentStyle}`;
      }
    }

    updateText({ fontStyle: newStyle.trim() as any });
  }, [editingData.fontStyle, updateText]);

  const handleLineHeightChange = useCallback((lineHeight: number) => {
    updateText({ lineHeight });
  }, [updateText]);

  const handleLetterSpacingChange = useCallback((letterSpacing: number) => {
    updateText({ letterSpacing });
  }, [updateText]);

  const isBold = (editingData.fontStyle || '').includes('bold');
  const isItalic = (editingData.fontStyle || '').includes('italic');

  return (
    <HStack spacing={6} wrap="wrap" align="flex-start">
      {/* Text Content */}
      <VStack align="flex-start" spacing={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Text Content
        </Text>
        
        <FormControl>
          <FormLabel fontSize="xs">Text</FormLabel>
          <Textarea
            value={editingData.text || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            size="sm"
            minH="60px"
            maxW="200px"
          />
        </FormControl>
      </VStack>

      {/* Font Properties */}
      <VStack align="flex-start" spacing={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Font
        </Text>
        
        <HStack spacing={2}>
          <FormControl>
            <FormLabel fontSize="xs">Size</FormLabel>
            <NumberInput
              value={editingData.fontSize || 24}
              onChange={(_, val) => !isNaN(val) && handleFontSizeChange(val)}
              size="sm"
              min={8}
              max={200}
              w="80px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Family</FormLabel>
            <Select
              value={editingData.fontFamily || 'Inter'}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              size="sm"
              w="120px"
            >
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times</option>
              <option value="Courier New">Courier</option>
              <option value="Georgia">Georgia</option>
            </Select>
          </FormControl>
        </HStack>

        {/* Font Style */}
        <FormControl>
          <FormLabel fontSize="xs">Style</FormLabel>
          <ButtonGroup size="sm" isAttached>
            <Button
              variant={isBold ? "solid" : "outline"}
              colorScheme={isBold ? "pink" : "gray"}
              onClick={() => handleStyleToggle('bold')}
              fontWeight="bold"
            >
              B
            </Button>
            <Button
              variant={isItalic ? "solid" : "outline"}
              colorScheme={isItalic ? "pink" : "gray"}
              onClick={() => handleStyleToggle('italic')}
              fontStyle="italic"
            >
              I
            </Button>
          </ButtonGroup>
        </FormControl>

        {/* Text Alignment */}
        <FormControl>
          <FormLabel fontSize="xs">Align</FormLabel>
          <ButtonGroup size="sm" isAttached>
            {['left', 'center', 'right', 'justify'].map((align) => (
              <Button
                key={align}
                variant={editingData.align === align ? "solid" : "outline"}
                colorScheme={editingData.align === align ? "pink" : "gray"}
                onClick={() => handleAlignChange(align)}
              >
                {align[0].toUpperCase()}
              </Button>
            ))}
          </ButtonGroup>
        </FormControl>
      </VStack>

      {/* Text Spacing */}
      <VStack align="flex-start" spacing={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Spacing
        </Text>
        
        <FormControl>
          <FormLabel fontSize="xs">Line Height</FormLabel>
          <Slider
            value={editingData.lineHeight || 1.2}
            onChange={handleLineHeightChange}
            min={0.5}
            max={3}
            step={0.1}
            colorScheme="pink"
            w="120px"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {(editingData.lineHeight || 1.2).toFixed(1)}
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs">Letter Spacing</FormLabel>
          <Slider
            value={editingData.letterSpacing || 0}
            onChange={handleLetterSpacingChange}
            min={-5}
            max={10}
            step={0.1}
            colorScheme="pink"
            w="120px"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {(editingData.letterSpacing || 0).toFixed(1)}px
          </Text>
        </FormControl>
      </VStack>
    </HStack>
  );
};

export default UniversalTextControls;