// src/pages/Studio/EditingToolbar/UniversalControls/ColorControls.tsx
import {
  HStack,
  VStack,
  Button,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import { SketchPicker, ColorResult } from 'react-color';
import { useState, useCallback } from 'react';
import { useEditing } from '~/hooks/use-editing';
import { getRGBAString } from '~/utils/get-rgba-string';
import { StageObjectType } from '~/types/stage-object';

const UniversalColorControls = () => {
  const { editingData, selectedObjectType, updateFill, updateStroke, availableFeatures } = useEditing();
  const [activeColorTab, setActiveColorTab] = useState(0);

  if (!editingData) return null;

  const handleSolidColorChange = useCallback((color: ColorResult) => {
    const rgbaColor = getRGBAString(color.rgb);
    updateFill({ 
      fill: rgbaColor, 
      fillPriority: 'color' 
    });
  }, [updateFill]);

  const handleStrokeColorChange = useCallback((color: ColorResult) => {
    const rgbaColor = getRGBAString(color.rgb);
    updateStroke({ stroke: rgbaColor });
  }, [updateStroke]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    updateStroke({ strokeWidth: width });
  }, [updateStroke]);

  const handleLinearGradientChange = useCallback((
    colorIndex: number,
    color: ColorResult