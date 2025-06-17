import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Image,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface CarouselProps {
  images: string[];
  selectedIndex: number;
  onImageSelect: (index: number) => void;
  height?: string;
}

const Carousel = ({ images, selectedIndex, onImageSelect, height = '300px' }: CarouselProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
 
  const nextImage = () => {
    const nextIndex = (selectedIndex + 1) % images.length;
    onImageSelect(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
    onImageSelect(prevIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (thumbnailsRef.current?.offsetLeft || 0));
    setScrollLeft(thumbnailsRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !thumbnailsRef.current) return;
    e.preventDefault();
    const x = e.pageX - (thumbnailsRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    thumbnailsRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[selectedIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedIndex]);

  if (!images.length) {
    return (
      <Box
        height={height}
        bg="gray.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
      >
        <Text color="gray.500">No images available</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Main Image Display */}
      <Box position="relative" height={height} borderRadius="md" overflow="hidden">
        <Image
          src={images[selectedIndex]}
          alt={`3D Overview ${selectedIndex + 1}`}
          width="100%"
          height="100%"
          objectFit="cover"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <IconButton
              aria-label="Previous image"
              icon={<HiChevronLeft />}
              position="absolute"
              left="2"
              top="50%"
              transform="translateY(-50%)"
              bg="blackAlpha.600"
              color="white"
              size="sm"
              borderRadius="full"
              _hover={{ bg: 'blackAlpha.800' }}
              onClick={prevImage}
            />
            <IconButton
              aria-label="Next image"
              icon={<HiChevronRight />}
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
              bg="blackAlpha.600"
              color="white"
              size="sm"
              borderRadius="full"
              _hover={{ bg: 'blackAlpha.800' }}
              onClick={nextImage}
            />
          </>
        )}
        
        {/* Image Counter */}
        <Box
          position="absolute"
          bottom="2"
          right="2"
          bg="blackAlpha.700"
          color="white"
          px="2"
          py="1"
          borderRadius="md"
          fontSize="sm"
        >
          {selectedIndex + 1} / {images.length}
        </Box>
      </Box>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <Box mt="4">
          <Flex
            ref={thumbnailsRef}
            overflowX="auto"
            gap="2"
            pb="2"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            css={{
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '2px',
              },
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                minW="60px"
                h="60px"
                cursor="pointer"
                borderRadius="md"
                overflow="hidden"
                border="2px solid"
                borderColor={index === selectedIndex ? 'pink.500' : 'transparent'}
                transition="all 0.2s"
                _hover={{
                  transform: 'scale(1.05)',
                  borderColor: index === selectedIndex ? 'pink.500' : 'gray.300',
                }}
                onClick={() => onImageSelect(index)}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default Carousel;