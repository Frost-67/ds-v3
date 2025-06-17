import { configureStore, combineReducers } from '@reduxjs/toolkit';
import frameReducer from './slices/frame-slice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import bottomTabsReducer from './slices/bottom-tabs-slice';
import rightSidebarReducer from './slices/right-sidebar-slice';
import canvasContextsReducer from './slices/canvas-contexts-slice';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['selected', 'copied'], // Don't persist these
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    frame: frameReducer,
    bottomTabs: bottomTabsReducer,
    rightSidebar: rightSidebarReducer,
    canvasContexts: canvasContextsReducer,
  }),
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export const persistor = persistStore(store);