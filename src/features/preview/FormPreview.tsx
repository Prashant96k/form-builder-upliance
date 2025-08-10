// Preview now uses its own slice,
// and can load from current builder OR from localStorage :id.

import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import FieldRenderer from 'components/FieldRenderer';
import { validateValueForField } from 'utils/validators';
import { computeDerived } from 'features/formBuilder/derivedUtils';

import { setFields, updateValue, mergeValues } from './previewSlice';
import type { RootState } from 'app/store';
import type { FormField } from 'features/types/form.types';

type SavedForm = {
  id: string;
  formName: string;
  fields: FormField[];
  createdAt: string;
};

const FormPreview: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams(); // /preview or /preview/:id

  const builder = useSelector((s: RootState) => s.formBuilder);
  const { fields, values } = useSelector((s: RootState) => s.preview);

  // Decide which fields to load into preview
  const fieldsToUse: FormField[] = useMemo(() => {
    if (!id) return builder.fields; // live builder
    const raw = localStorage.getItem('forms');
    if (!raw) return [];
    const list: SavedForm[] = JSON.parse(raw);
    const item = list.find((x) => x.id === id);
    return item?.fields || [];
  }, [id, builder.fields]);

  // Whenever target fields change, set them in preview slice
  useEffect(() => {
    dispatch(setFields(fieldsToUse));
  }, [dispatch, fieldsToUse]);

  // Recompute derived whenever values or fields change
  useEffect(() => {
    if (!fields.length) return;
    const derived = computeDerived(fields, values);
    if (Object.keys(derived).length) {
      dispatch(mergeValues(derived));
    }
  }, [dispatch, fields, values]);

  // Validate all on submit (no user value storage)
  const handleSubmit = () => {
    let ok = true;
    for (const f of fields) {
      const es = validateValueForField(values[f.id] ?? '', f);
      if (es.length) {
        ok = false;
        alert(es[0]); // quick feedback; you can improve UX later
        break;
      }
    }
    if (ok) alert('Form is valid! (No user value storage required.)');
  };

  if (!fields.length) {
    return (
      <Box p={3}>
        <Typography>No form to preview. Build one in /create or open from /myforms.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth={900} mx="auto">
      <Typography variant="h5" fontWeight={700} mb={2}>Preview</Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          {fields.map((f) => (
            <FieldRenderer
              key={f.id}
              field={f}
              value={values[f.id] ?? ''}
              // Inline quick validation (optional)
              errors={validateValueForField(values[f.id] ?? '', f)}
              onChange={(val) => dispatch(updateValue({ id: f.id, value: val }))}
            />
          ))}

          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FormPreview;
