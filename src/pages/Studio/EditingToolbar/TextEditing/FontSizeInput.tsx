import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tooltip,
} from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';

type Props = {
  id: string;
  fontSize: number;
};

const minVal = 1;
const maxVal = 800;
const step = 1;

const FontSizeInput = ({ id, fontSize }: Props) => {
  const { updateObject } = useCanvasContexts();

  const handleFontSizeChange = (valueAsString: string, valueAsNumber: number) => {
    const regex = /^\d{1,3}$/;

    if (regex.test(valueAsString) && valueAsNumber >= minVal && valueAsNumber <= maxVal) {
      updateObject(id, { fontSize: valueAsNumber });
    }
  };

  return (
    <NumberInput
      size="md"
      maxW={20}
      value={fontSize}
      min={minVal}
      max={maxVal}
      step={step}
      onChange={handleFontSizeChange}
    >
      <Tooltip hasArrow label="Font size" placement="bottom" openDelay={500}>
        <NumberInputField />
      </Tooltip>
      <NumberInputStepper>
        <NumberIncrementStepper>+</NumberIncrementStepper>
        <NumberDecrementStepper>-</NumberDecrementStepper>
      </NumberInputStepper>
    </NumberInput>
  );
};

export default FontSizeInput;