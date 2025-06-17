import React from 'react';
import Konva from 'konva';
import { Button, useToast } from '@chakra-ui/react';
import { useAppContext } from '~/context/AppContext';

type IProps = {
  stageRef: React.RefObject<Konva.Stage> | null;
};

const Export = ({ stageRef }: IProps) => {
  const { getCurrentView } = useAppContext();
  const toast = useToast();

  const downloadFile = (dataUrl: string, filename: string) => {
    // Use modern approach with URL.createObjectURL if possible
    try {
      const a = Object.assign(document.createElement('a'), {
        href: dataUrl,
        download: filename,
        style: 'display: none'
      });

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: `Downloaded ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to download file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExport = () => {
    if (!stageRef?.current) {
      toast({
        title: 'Export Error',
        description: 'Canvas not ready for export',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Get canvas dimensions from current view instead of frame slice
      const currentView = getCurrentView();
      const width = currentView?.canvas.width || 1080;
      const height = currentView?.canvas.height || 1080;

      const dataURL = stageRef.current.toDataURL({
        x: stageRef.current.attrs.x || 0,
        y: stageRef.current.attrs.y || 0,
        width: width * (stageRef.current.scaleX() || 1),
        height: height * (stageRef.current.scaleY() || 1),
        pixelRatio: 1 / (stageRef.current.attrs.scaleX || 1),
      });

      downloadFile(dataURL, 'octopus-2d-export.png');
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to generate image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Button onClick={handleExport} w="100%" colorScheme="pink">
      Export as PNG
    </Button>
  );
};

export default Export;