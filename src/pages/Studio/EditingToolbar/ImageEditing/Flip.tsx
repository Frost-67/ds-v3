import { Button } from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { StageObject } from '~/types/stage-object';

type Props = {
  selectedObject: StageObject;
};

const ImageFlip = ({ selectedObject }: Props) => {
  const { id, data } = selectedObject;
  const { updateObject } = useCanvasContexts();

  const flipVertically = () => {
    const offsetY = data.height / 2;
    const scaleY = -1 * data.scaleY;
    updateObject(id, { offsetY, scaleY });
  };

  const flipHorizontally = () => {
    const offsetX = data.width / 2;
    const scaleX = -1 * data.scaleX;
    updateObject(id, { offsetX, scaleX });
  };

  return (
    <>
      <Button onClick={() => flipVertically()}>Flip vertically</Button>
      <Button onClick={() => flipHorizontally()}>Flip horizontally</Button>
    </>
  );
};

export default ImageFlip;