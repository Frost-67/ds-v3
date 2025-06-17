
import Konva from 'konva';
import { useRef, useCallback } from 'react';
import { useCanvasContexts } from './use-canvas-contexts';

type Props = {
  stageRef?: React.RefObject<Konva.Stage | null> | null;
};

const useTransformer = ({ stageRef }: Props) => {
  const { updateObject, saveToHistory, selected } = useCanvasContexts();

  const imageTransformer = useRef<Konva.Transformer | null>(null);
  const textTransformer = useRef<Konva.Transformer | null>(null);
  const multiTransformer = useRef<Konva.Transformer | null>(null);

  const transformStateRef = useRef({
    isTransforming: false,
    transformStarted: false,
  });

  const onTransformStart = useCallback(() => {
    if (!transformStateRef.current.transformStarted) {
      saveToHistory();
      transformStateRef.current.isTransforming = true;
      transformStateRef.current.transformStarted = true;
    }
  }, [saveToHistory]);

  const onTransformerEnd = useCallback(() => {
    if (!stageRef?.current) return;

    console.log('🔧 Transform ended, updating objects');

    const selectedNodes = selected.map(id =>
      stageRef.current?.findOne(`#${id}`)
    ).filter(Boolean) as Konva.Node[];

    if (selectedNodes.length > 0) {
      selectedNodes.forEach((node: Konva.Node) => {
        const id = node.attrs.id;

        // Get all transform properties
        const transformData = {
          x: node.x(),
          y: node.y(),
          width: node.width(),
          height: node.height(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
          offsetX: node.offsetX(),
          offsetY: node.offsetY(),
          updatedAt: Date.now(),
        };

        console.log(`📝 Updating transformed object ${id}:`, transformData);

        try {
          updateObject(id, transformData);
        } catch (error) {
          console.error(`Error updating object ${id}:`, error);
        }
      });

      if (transformStateRef.current.isTransforming) {
        setTimeout(() => {
          saveToHistory();
          transformStateRef.current.isTransforming = false;
          transformStateRef.current.transformStarted = false;
        }, 100);
      }
    }

    try {
      imageTransformer.current?.getStage()?.batchDraw();
      textTransformer.current?.getStage()?.batchDraw();
      multiTransformer.current?.getStage()?.batchDraw();
    } catch (error) {
      console.error('Error redrawing stage after transform:', error);
    }
  }, [selected, stageRef, updateObject, saveToHistory]);

  return {
    transformers: {
      imageTransformer,
      textTransformer,
      multiTransformer,
    },
    onTransformerEnd,
    onTransformStart,
  };
};

export default useTransformer;