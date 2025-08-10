// Preview slice: holds preview-only fields & values

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FormField } from 'features/types/form.types';


interface PreviewState {
  fields: FormField[];
  values: Record<string, string>;
}

const initialState: PreviewState = {
  fields: [],
  values: {},
};

const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    // Set fields and reset values from defaults
    setFields(state, action: PayloadAction<FormField[]>) {
      state.fields = action.payload;
      const next: Record<string, string> = {};
      for (const f of action.payload) next[f.id] = f.defaultValue ?? '';
      state.values = next;
    },
    // Update single value by field id
    updateValue(state, action: PayloadAction<{ id: string; value: string }>) {
      state.values[action.payload.id] = action.payload.value;
    },
    // Bulk merge (used after computing derived)
    mergeValues(state, action: PayloadAction<Record<string, string>>) {
      state.values = { ...state.values, ...action.payload };
    },
    resetPreview(state) {
      state.fields = [];
      state.values = {};
    },
  },
});

export const { setFields, updateValue, mergeValues, resetPreview } = previewSlice.actions;
export default previewSlice.reducer;
