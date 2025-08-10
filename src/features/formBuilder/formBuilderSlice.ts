import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FormField } from '../types/form.types';
import { v4 as uuid } from 'uuid';


// Shape of our form builder state in Redux
interface FormBuilderState {
  formName: string;
  fields: FormField[];
}

// Initial state
const initialState: FormBuilderState = {
  formName: '',
  fields: [],
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    setFormName(state, action: PayloadAction<string>) {
      state.formName = action.payload;
    },

    addField(state, action: PayloadAction<Omit<FormField, 'id'>>) {
      const newField: FormField = { ...action.payload, id: uuid() };
      state.fields.push(newField);
    },

    updateField(state, action: PayloadAction<FormField>) {
      const index = state.fields.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.fields[index] = action.payload;
      }
    },

    deleteField(state, action: PayloadAction<string>) {
      state.fields = state.fields.filter((field) => field.id !== action.payload);
    },

    moveField(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      const updated = [...state.fields];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      state.fields = updated;
    },

    resetForm(state) {
      state.formName = '';
      state.fields = [];
    },

    loadForm(state, action: PayloadAction<FormBuilderState>) {
      state.formName = action.payload.formName;
      state.fields = action.payload.fields;
    },
  },
});

// Export actions for dispatch
export const {
  setFormName,
  addField,
  updateField,
  deleteField,
  moveField,
  resetForm,
  loadForm,
} = formBuilderSlice.actions;

// Export reducer for store.ts
export default formBuilderSlice.reducer;
