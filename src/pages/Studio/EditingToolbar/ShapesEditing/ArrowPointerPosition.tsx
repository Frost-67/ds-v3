import { useState, useEffect } from 'react';
import { Menu, MenuButton, MenuList, Button, Switch, FormControl, FormLabel, Box } from '@chakra-ui/react';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts'; 
import { StageObjectData } from '~/types/stage-object';

type IProps = {
  shapeId: string;
  selectedObject: StageObjectData;
};

const ArrowPointerPosition = ({ shapeId, selectedObject }: IProps) => {
  const { updateObject } = useCanvasContexts(); 

  const [isPointerAtBeginning, setIsRointerAtBeginning] = useState(!!selectedObject.pointerAtBeginning);
  const [isPointerAtEnding, setIsRointerAtEnding] = useState(!!selectedObject.pointerAtEnding);

  useEffect(() => {
    setIsRointerAtBeginning(!!selectedObject.pointerAtBeginning);
    setIsRointerAtEnding(!!selectedObject.pointerAtEnding);
  }, [shapeId]);

  const handleIsPointerAtBeginningChange = () => {
    setIsRointerAtBeginning(!isPointerAtBeginning);
    updateObject(shapeId, { pointerAtBeginning: !isPointerAtBeginning }); 
  };

  const handleIsPointerAtEndingChange = () => {
    setIsRointerAtEnding(!isPointerAtEnding);
    updateObject(shapeId, { pointerAtEnding: !isPointerAtEnding }); 
  };

  return (
    <Box>
      <Menu>
        <MenuButton as={Button}>Pointer position</MenuButton>
        <MenuList paddingX="10px">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="pointer-at-beginning-switch">Pointer at beginning</FormLabel>
            <Switch
              id="pointer-at-beginning-switch"
              isChecked={isPointerAtBeginning}
              onChange={handleIsPointerAtBeginningChange}
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="pointer-at-ending-switch">Pointer at ending</FormLabel>
            <Switch
              id="pointer-at-ending-switch"
              isChecked={isPointerAtEnding}
              onChange={handleIsPointerAtEndingChange}
            />
          </FormControl>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default ArrowPointerPosition;