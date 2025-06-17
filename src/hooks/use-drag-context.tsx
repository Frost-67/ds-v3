import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DragState {
  isDragging: boolean;
  draggedObjectId: string | null;
  draggedObjectPosition: { x: number; y: number } | null;
  currentSnapPosition: { x: number; y: number } | null;
}

interface DragContextType {
  dragState: DragState;
  setDragState: (state: DragState) => void;
  startDrag: (objectId: string, position: { x: number; y: number }) => void;
  updateDragPosition: (position: { x: number; y: number }, snapPosition?: { x: number; y: number }) => void;
  endDrag: () => void;
}

const DragContext = createContext<DragContextType | null>(null);

export const DragProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedObjectId: null,
    draggedObjectPosition: null,
    currentSnapPosition: null,
  });

  const startDrag = useCallback((objectId: string, position: { x: number; y: number }) => {
    setDragState({
      isDragging: true,
      draggedObjectId: objectId,
      draggedObjectPosition: position,
      currentSnapPosition: position,
    });
  }, []);

  const updateDragPosition = useCallback((
    position: { x: number; y: number }, 
    snapPosition?: { x: number; y: number }
  ) => {
    setDragState(prev => ({
      ...prev,
      draggedObjectPosition: position,
      currentSnapPosition: snapPosition || position,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedObjectId: null,
      draggedObjectPosition: null,
      currentSnapPosition: null,
    });
  }, []);

  const contextValue: DragContextType = {
    dragState,
    setDragState,
    startDrag,
    updateDragPosition,
    endDrag,
  };

  return (
    <DragContext.Provider value={contextValue}>
      {children}
    </DragContext.Provider>
  );
};

export const useDragContext = (): DragContextType => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
};