import {
  VStack,
  Text,
  Divider,
  Box,
} from '@chakra-ui/react';
import { useCurrentUnit } from '~/context/AppContext';
import Carousel from '~/components/Carousel/Carousel';
import Summary from '~/components/Summary/Summary';
import { useState } from 'react';

const ThreeDOverviewTab = () => {
  const currentUnit = useCurrentUnit();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!currentUnit?.overview3D) {
    return (
      <VStack spacing="4" align="stretch" h="100%" overflowY="scroll">
        <Text>No 3D overview data available</Text>
      </VStack>
    );
  }

  const { overview3D } = currentUnit;

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <VStack spacing="4" align="stretch" h="100%" overflowY="scroll">
      {/* Header */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color="pink.500" mb="2">
          3D Design Overview
        </Text>
        <Text fontSize="sm" color="gray.600">
          Browse 3D references and inspirations for your {currentUnit.unitInfo.name.toLowerCase()} design project.
        </Text>
      </Box>

      <Divider />

      {/* Carousel */}
      <Box flexShrink={0}>
        <Carousel
          images={overview3D.images}
          selectedIndex={selectedImageIndex}
          onImageSelect={handleImageSelect}
          height="220px"
        />
      </Box>

      {/* Summary */}
      {overview3D.summary && (
        <>
          <Divider />
          <Summary
            title={overview3D.summary.title}
            description={overview3D.summary.description}
            stats={overview3D.summary.stats}
          />
        </>
      )}
    </VStack>
  );
};

export default ThreeDOverviewTab;