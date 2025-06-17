import { createSlice } from '@reduxjs/toolkit';
import { StageObject } from '~/types/stage-object';

export type IStageState = {
  id: string | null;
  name: string | null;
  description: string | null;
  content?: StageObject[] | null;
};

export type IFrameState = {
  stage: IStageState;
  width: number;
  height: number;
  scale: number;
};

const initialState: IFrameState = {
  stage: {
    id: 'local-canvas',
    name: 'New Canvas',
    description: 'Local design canvas',
    content: [],
  },
  width: 1080,
  height: 1080,
  scale: 1,
};

const frameSlice = createSlice({
  name: 'frame',
  initialState,
  reducers: {
    updateCanvasName(state, { payload }) {
      state.stage.name = payload;
    },
    updateCanvasDescription(state, { payload }) {
      state.stage.description = payload;
    },
    resetCanvas(state) {
      state.stage.name = 'New Canvas';
      state.stage.description = 'Local design canvas';
      state.stage.content = [];
    },
    setSize(state, { payload }) {
      state.width = payload.width;
      state.height = payload.height;
    },
    setScale(state, { payload }) {
      state.scale = payload.scale;
    },
  },
});

export const {
  updateCanvasName,
  updateCanvasDescription,
  resetCanvas,
  setSize,
  setScale
} = frameSlice.actions;

export default frameSlice.reducer;