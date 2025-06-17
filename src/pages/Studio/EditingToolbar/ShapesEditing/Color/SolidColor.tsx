import { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts'; 
import { getRGBAString } from '~/utils/get-rgba-string';
import { StageObjectData } from '~/types/stage-object';
import { ShapeType } from '~/types/shape-type';

type IProps = {
  shapeId: string;
  selectedObject: StageObjectData;
};

const SolidColor = ({ shapeId, selectedObject }: IProps) => {
  const { updateObject } = useCanvasContexts(); 

  const [color, setColor] = useState(selectedObject.fill);

  useEffect(() => {
    setColor(selectedObject.fill);
  }, [shapeId]);

  const handleSolidColorChange = (c: ColorResult) => {
    const rgbaC = getRGBAString(c.rgb);
    setColor(rgbaC);

    let stroke = selectedObject.stroke;
    if (selectedObject.shapeType === ShapeType.ARROW) {
      stroke = rgbaC;
    }

    updateObject(shapeId, { 
      fill: rgbaC, 
      fillPriority: 'color', 
      stroke 
    });
  };

  return <SketchPicker color={color} onChangeComplete={handleSolidColorChange} />;
};

export default SolidColor;