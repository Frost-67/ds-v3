import { Image, SimpleGrid } from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { DEFAULT_SHAPE_OBJECT } from '~/consts/stage-object';
import { shapesItems, shapeItemType } from './shapes_items';

const Shapes = () => {
  const { createObject } = useCanvasContexts();

  const addShapeToStage = (shapeItem: shapeItemType) => {
    createObject({
      ...DEFAULT_SHAPE_OBJECT,
      ...shapeItem,
    });
  };

  return (
    <SimpleGrid columns={3} spacing={10}>
      {shapesItems.map((shapeItem, index) => (
        <Image
          key={index}
          src={shapeItem.src}
          alt={shapeItem.name}
          onClick={() => addShapeToStage(shapeItem)}
          cursor="pointer"
        />
      ))}
    </SimpleGrid>
  );
};

export default Shapes;
