import { Button, Tooltip } from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts'; 
import { StageTextData } from '~/types/stage-object';

type Props = {
  id: string;
  fontVariants: StageTextData['fontVariants'];
  webFont: boolean; // Always false now, but keeping for compatibility
  fontStyle: StageTextData['fontStyle'];
};

const FontStyleSettings = ({ id, fontStyle }: Props) => {
  const { updateObject } = useCanvasContexts(); 

  const isBoldActive = fontStyle.includes('bold');
  const isItalicActive = fontStyle.includes('italic');

  const handleBoldClick = () => {
    updateObject(id, { fontStyle: toggleBold(fontStyle) }); 
  };

  const handleItalicClick = () => {
    updateObject(id, { fontStyle: toggleItalic(fontStyle) }); 
  };

  const toggleBold = (fontStyle: StageTextData['fontStyle']) => {
    switch (fontStyle) {
      case 'normal':
        return 'bold';
      case 'italic':
        return 'italic bold';
      case 'bold':
        return 'normal';
      case 'italic bold':
        return 'italic';
      default:
        return 'normal';
    }
  };

  const toggleItalic = (fontStyle: StageTextData['fontStyle']) => {
    switch (fontStyle) {
      case 'normal':
        return 'italic';
      case 'italic':
        return 'normal';
      case 'bold':
        return 'italic bold';
      case 'italic bold':
        return 'bold';
      default:
        return 'normal';
    }
  };

  return (
    <>
      <Tooltip hasArrow label="Bold" placement="bottom" openDelay={500}>
        <Button
          isActive={isBoldActive}
          fontWeight="bold"
          fontSize="xl"
          onClick={handleBoldClick}
        >
          B
        </Button>
      </Tooltip>
      
      <Tooltip hasArrow label="Italics" placement="bottom" openDelay={500}>
        <Button
          isActive={isItalicActive}
          fontStyle="italic"
          fontSize="xl"
          fontFamily="Arial, sans-serif"
          onClick={handleItalicClick}
        >
          I
        </Button>
      </Tooltip>
    </>
  );
};

export default FontStyleSettings;
