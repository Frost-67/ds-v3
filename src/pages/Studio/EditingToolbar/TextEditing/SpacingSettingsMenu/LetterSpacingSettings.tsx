import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import CustomNumberInput from './CustomNumberInput';

type Props = {
  id: string;
  letterSpacing: number;
};

const LetterSpacingSettings = ({ id, letterSpacing }: Props) => {
  const { updateObject } = useCanvasContexts();

  const handleChange = (value: number) => {
    updateObject(id, { letterSpacing: value });
  };

  return (
    <CustomNumberInput
      min={-15}
      max={250}
      step={1}
      label="Letter spacing"
      mark={0}
      value={letterSpacing}
      pattern={/^-?\d{1,3}$/}
      onChange={handleChange}
    />
  );
};

export default LetterSpacingSettings;