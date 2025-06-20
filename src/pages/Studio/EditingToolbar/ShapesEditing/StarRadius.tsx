import { useState, useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  Button,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderThumb,
  Box,
} from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { StageObjectData } from '~/types/stage-object';

type IProps = {
  shapeId: string;
  selectedObject: StageObjectData;
};

const StarRadius = ({ shapeId, selectedObject }: IProps) => {
  const { updateObject } = useCanvasContexts();

  const [innerRadius, setInnerRadius] = useState(selectedObject.innerRadius);

  useEffect(() => {
    setInnerRadius(selectedObject.innerRadius);
  }, [shapeId]);

  const handleInnerRadiusChange = (ir: number) => {
    setInnerRadius(ir);
    updateObject(shapeId, { innerRadius: ir });
  };

  return (
    <Box>
      <Menu>
        <MenuButton as={Button}>Radius</MenuButton>
        <MenuList paddingX="10px">
          <FormControl>
            <FormLabel htmlFor="inner-radius-slider" fontWeight="normal">
              Inner radius:
            </FormLabel>
            <Slider
              id="inner-radius-slider"
              aria-label="inner-radius-slider"
              value={innerRadius}
              min={5}
              max={selectedObject.outerRadius}
              onChange={handleInnerRadiusChange}
            >
              <SliderTrack />
              <SliderThumb />
            </Slider>
          </FormControl>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default StarRadius;