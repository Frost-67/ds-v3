import { StageObject } from '~/types/stage-object';
import TextColorPicker from './TextColorPicker';
import FontSizeInput from './FontSizeInput';
import FontStyleSettings from './FontStyleSettings';
import TextDecorationSettings from './TextDecorationSettings';
import TextAlignment from './TextAlignment';
import SpacingSettingsMenu from './SpacingSettingsMenu/SpacingSettingsMenu';

type Props = {
  selectedObject: StageObject;
};

const TextEditing = ({ selectedObject }: Props) => {
  return (
    <>
      {/* Basic font size control */}
      <FontSizeInput id={selectedObject.id} fontSize={selectedObject.data.fontSize} />
      
      {/* Text color picker */}
      <TextColorPicker id={selectedObject.id} selectedObject={selectedObject.data} />
      
      {/* Font style (bold/italic) */}
      <FontStyleSettings
        id={selectedObject.id}
        fontVariants={selectedObject.data.fontVariants || ['400']}
        fontStyle={selectedObject.data.fontStyle}
        webFont={false} // Always false since we're not using web fonts
      />
      
      {/* Text decoration (underline/strikethrough) */}
      <TextDecorationSettings 
        id={selectedObject.id} 
        textDecoration={selectedObject.data.textDecoration} 
      />
      
      {/* Text alignment */}
      <TextAlignment 
        id={selectedObject.id} 
        textAlign={selectedObject.data.align} 
      />
      
      {/* Spacing controls (letter spacing and line height) */}
      <SpacingSettingsMenu
        id={selectedObject.id}
        letterSpacing={selectedObject.data.letterSpacing}
        lineHeight={selectedObject.data.lineHeight}
      />
    </>
  );
};

export default TextEditing;