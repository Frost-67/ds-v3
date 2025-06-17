import { Button, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/use-app-selector';
import { setSize } from '~/store/slices/frame-slice';

const sizes = [
  {
    name: 'Standard Size',
    width: 1080,
    height: 1080,
  },
];

const Resize = () => {
  const dispatch = useDispatch();

  const { width: frameWidth, height: frameHight } = useAppSelector((state) => state.frame);
  const [width, setWidth] = useState<string>(`${frameWidth}`);
  const [height, setHeight] = useState<string>(`${frameHight}`);

  const handleChangeWidth = (event: React.SyntheticEvent) => {
    const w = (event.target as HTMLInputElement).value;
    setWidth(w);
  };

  const handleChangeHeight = (event: React.SyntheticEvent) => {
    const h = (event.target as HTMLInputElement).value;
    setHeight(h);
  };

  const checkInput = (input: number) => {
    if (input < 10) {
      input = 10;
    } else if (input > 10000) {
      input = 10000;
    }
    return input;
  };

  const handleBlurWidth = (event: React.SyntheticEvent) => {
    let w = Number((event.target as HTMLInputElement).value);
    w = checkInput(w);
    setWidth(`${w}`);
    dispatch(
      setSize({
        width: w,
        height: frameHight,
      }),
    );
  };

  const handleBlurHeight = (event: React.SyntheticEvent) => {
    let h = Number((event.target as HTMLInputElement).value);
    h = checkInput(h);
    setHeight(`${h}`);
    dispatch(
      setSize({
        width: frameWidth,
        height: h,
      }),
    );
  };

  const handleResize = (index: number) => {
    setWidth(`${sizes[index].width}`);
    setHeight(`${sizes[index].height}`);

    dispatch(
      setSize({
        width: sizes[index].width,
        height: sizes[index].height,
      }),
    );
  };

  return (
    <VStack>
      <FormControl display="flex" justifyContent="space-between">
        <FormLabel htmlFor="width" marginY="auto">
          Width (px)
        </FormLabel>
        <Input
          id="width"
          placeholder="width"
          type="number"
          width="100px"
          value={width}
          focusBorderColor="pink.500"
          onChange={handleChangeWidth}
          onBlur={handleBlurWidth}
        />
      </FormControl>
      <FormControl display="flex" justifyContent="space-between">
        <FormLabel htmlFor="height" marginY="auto">
          Height (px)
        </FormLabel>
        <Input
          id="height"
          placeholder="height"
          type="number"
          width="100px"
          value={height}
          focusBorderColor="pink.500"
          onChange={handleChangeHeight}
          onBlur={handleBlurHeight}
        />
      </FormControl>

      {sizes.map((size, index) => (
        <Button
          key={index}
          onClick={() => {
            handleResize(index);
          }}
          size="sm"
          w="100%"
        >
          {size.name} {size.width} x {size.height} px
        </Button>
      ))}
    </VStack>
  );
};

export default Resize;
