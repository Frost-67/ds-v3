import { SyntheticEvent, useRef } from 'react';
import { 
  InputGroup, 
  Button, 
  VStack, 
  Text, 
  Icon, 
  useToast 
} from '@chakra-ui/react';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { DEFAULT_IMAGE_OBJECT } from '~/consts/stage-object';

const ImageUpload = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { createObject } = useCanvasContexts();
  const toast = useToast();

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = (e: SyntheticEvent) => {
    const files = (e.target as HTMLInputElement).files;
    
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (PNG, JPG, GIF, etc.)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Create object URL for the uploaded file
      const imageUrl = URL.createObjectURL(file);
      
      // Add image directly to canvas
      createObject({
        ...DEFAULT_IMAGE_OBJECT,
        src: imageUrl,
        x: 100 + Math.random() * 100, // Random position to avoid overlap
        y: 100 + Math.random() * 100,
      });

      toast({
        title: 'Image uploaded',
        description: 'Image has been added to your canvas',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Reset the input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <VStack spacing={6} p={4}>
      {/* Upload Button */}
      <InputGroup onClick={handleClick}>
        <input 
          type="file" 
          hidden 
          accept="image/*" 
          onChange={handleFileUpload} 
          ref={inputRef} 
        />
        <VStack 
          overflow="hidden" 
          align="center" 
          w="100%" 
          spacing={3}
          p={8}
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="lg"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: 'pink.400',
            bg: 'pink.50'
          }}
        >
          <Icon as={HiOutlineCloudUpload} boxSize={8} color="gray.400" />
          <Button colorScheme="pink" size="lg" w="100%">
            Upload Image
          </Button>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Click to upload or drag and drop
            <br />
            PNG, JPG, GIF up to 10MB
          </Text>
        </VStack>
      </InputGroup>

      {/* Instructions */}
      <VStack spacing={2} w="100%">
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          How to use:
        </Text>
        <VStack spacing={1} fontSize="xs" color="gray.600" align="start" w="100%">
          <Text>• Click "Upload Image" to select a file</Text>
          <Text>• Supported formats: PNG, JPG, GIF, WebP</Text>
          <Text>• Images are added directly to your canvas</Text>
          <Text>• You can resize and move images after upload</Text>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default ImageUpload;