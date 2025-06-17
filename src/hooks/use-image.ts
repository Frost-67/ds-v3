import { useLayoutEffect, useRef, useState } from 'react';
import { useCanvasContexts } from './use-canvas-contexts';

type StatusType = 'loading' | 'loaded' | 'failed';

const useImage = (url: string, id: string) => {
  const [, setStateToken] = useState(0);
  const [status, setStatus] = useState<StatusType>('loading');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { objects } = useCanvasContexts(); 
  useLayoutEffect(() => {
    if (!url) return;
    const img = document.createElement('img');

    img.addEventListener('load', () => {
      setStatus('loaded');
      imageRef.current = img;
      setStateToken(Math.random());
    });

    img.addEventListener('error', () => {
      setStatus('failed');
      imageRef.current = null;
      setStateToken(Math.random());
      console.warn(`Failed to load image: ${url} for object ${id}`);
    });

    img.crossOrigin = 'anonymous';
    img.src = url;
  }, [url, id, objects]);

  return [imageRef.current, status];
};

export default useImage;
