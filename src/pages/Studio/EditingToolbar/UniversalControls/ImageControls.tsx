import {
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Text,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useEditing } from '~/hooks/use-editing';

const UniversalImageControls = () => {
  const { editingData, updateImage } = useEditing();

  if (!editingData) return null;

  const handleFilterChange = useCallback((filterName: string, value: number) => {
    const currentFilters = editingData.filterValues || {};
    const currentFilterNames = editingData.filterNames || [];
    
    const newFilterValues = { ...currentFilters, [filterName]: value };
    let newFilterNames = [...currentFilterNames];
    
    // Add filter name if not present and value is not default
    if (!newFilterNames.includes(filterName) && value !== 0) {
      newFilterNames.push(filterName);
    }
    
    // Remove filter name if value is back to default
    if (value === 0) {
      newFilterNames = newFilterNames.filter(name => name !== filterName);
      delete newFilterValues[filterName];
    }
    
    updateImage({
      filterNames: newFilterNames,
      filterValues: newFilterValues,
    });
  }, [editingData.filterValues, editingData.filterNames, updateImage]);

  const handleBooleanFilter = useCallback((filterName: string, enabled: boolean) => {
    const currentFilterNames = editingData.filterNames || [];
    let newFilterNames = [...currentFilterNames];
    
    if (enabled && !newFilterNames.includes(filterName)) {
      newFilterNames.push(filterName);
    } else if (!enabled) {
      newFilterNames = newFilterNames.filter(name => name !== filterName);
    }
    
    updateImage({ filterNames: newFilterNames });
  }, [editingData.filterNames, updateImage]);

  const resetFilters = useCallback(() => {
    updateImage({
      filterNames: [],
      filterValues: {},
    });
  }, [updateImage]);

  const brightnessValue = editingData.filterValues?.brighten || 0;
  const contrastValue = editingData.filterValues?.contrast || 0;
  const isGrayscale = editingData.filterNames?.includes('Grayscale') || false;
  const isInverted = editingData.filterNames?.includes('Invert') || false;

  return (
    <HStack spacing={6} wrap="wrap" align="flex-start">
      {/* Basic Adjustments */}
      <VStack align="flex-start" spacing={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Adjustments
        </Text>
        
        <FormControl>
          <FormLabel fontSize="xs">Brightness</FormLabel>
          <Slider
            value={brightnessValue}
            onChange={(val) => handleFilterChange('brighten', (val - 50) / 50)}
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
            {Math.round(brightnessValue * 100)}%
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs">Contrast</FormLabel>
          <Slider
            value={contrastValue}
            onChange={(val) => handleFilterChange('contrast', (val - 50) / 50)}
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
            {Math.round(contrastValue * 100)}%
          </Text>
        </FormControl>
      </VStack>

      {/* Style Filters */}
      <VStack align="flex-start" spacing={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Style Filters
        </Text>
        
        <FormControl display="flex" alignItems="center">
          <FormLabel fontSize="sm" mb={0}>Grayscale</FormLabel>
          <Switch
            isChecked={isGrayscale}
            onChange={(e) => handleBooleanFilter('Grayscale', e.target.checked)}
            colorScheme="pink"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel fontSize="sm" mb={0}>Invert</FormLabel>
          <Switch
            isChecked={isInverted}
            onChange={(e) => handleBooleanFilter('Invert', e.target.checked)}
            colorScheme="pink"
          />
        </FormControl>

        <Button
          size="sm"
          variant="outline"
          onClick={resetFilters}
          colorScheme="gray"
        >
          Reset Filters
        </Button>
      </VStack>
    </HStack>
  );
};

export default UniversalImageControls;