import { useState, useEffect } from 'react';
import { FormControl, FormLabel, Slider, SliderTrack, SliderThumb } from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { StageObjectData } from '~/types/stage-object';

type IProps = {
  shapeId: string;
  selectedObject: StageObjectData;
};

const AllCorners = ({ shapeId, selectedObject }: IProps) => {
  const { updateObject } = useCanvasContexts();

  const getAllCornerRadius = () => {
    if (selectedObject.cornerRadius === undefined || Array.isArray(selectedObject.cornerRadius)) {
      return 0;
    }
    return selectedObject.cornerRadius;
  };

  const [allCornersRadius, setAllCornersRadius] = useState(getAllCornerRadius());

  useEffect(() => {
    setAllCornersRadius(getAllCornerRadius());
  }, [shapeId]);

  const handleAllCornersRadiusChange = (r: number) => {
    setAllCornersRadius(r);
    updateObject(shapeId, { cornerRadius: r });
  };

  return (
    <FormControl>
      <FormLabel htmlFor="all-corners-slider" fontWeight="normal">
        All corners:
      </FormLabel>
      <Slider
        id="all-corners-slider"
        aria-label="all-corners-slider"
        value={allCornersRadius}
        min={0}
        max={selectedObject.width / 2}
        onChange={handleAllCornersRadiusChange}
      >
        <SliderTrack />
        <SliderThumb />
      </Slider>
    </FormControl>
  );
};

export default AllCorners;