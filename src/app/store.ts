// Redux Toolkit store

import { configureStore } from '@reduxjs/toolkit';
import formBuilderReducer from 'features/formBuilder/formBuilderSlice';
import previewReducer from 'features/preview/previewSlice'; // <-- add

export const store = configureStore({
  reducer: {
    formBuilder: formBuilderReducer,
    preview: previewReducer, // <-- add
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
