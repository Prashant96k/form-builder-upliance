// src/features/formBuilder/FormBuilder.tsx
// Purpose: Build form schema (/create). Now includes Edit dialog via FieldEditor.

import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Button, TextField, FormControlLabel, Switch, Select, MenuItem,
  Stack, Paper, IconButton, Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'app/store';
import {
  addField, deleteField, moveField, setFormName, updateField, resetForm
} from './formBuilderSlice';
import type { FormField, FieldType } from '../types/form.types';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import FieldEditor from './FieldEditor'; // ← use the dialog

// helper: which field types need options
const needsOptions = (t: FieldType) => ['select', 'radio', 'checkbox'].includes(t);

// default skeleton for a new field (without id)
const defaultNewField: Omit<FormField, 'id'> = {
  label: '',
  type: 'text',
  defaultValue: '',
  validations: { required: false },
  options: [],
  derived: { isDerived: false, parents: [], formula: '' },
};

const FormBuilder: React.FC = () => {
  const dispatch = useDispatch();
  // pull current schema from redux
  const { fields, formName } = useSelector((s: RootState) => s.formBuilder);

  // local state for "Add Field" section
  const [newField, setNewField] = useState<Omit<FormField, 'id'>>(defaultNewField);

  // editor dialog controls
  const [editOpen, setEditOpen] = useState(false);            // dialog show/hide
  const [editing, setEditing] = useState<FormField | null>(null); // currently editing field

  // bounds check for move up/down
  const canMoveUp = (i: number) => i > 0;
  const canMoveDown = (i: number) => i < fields.length - 1;

  // add field to schema
  const handleAddField = () => {
    // guard: need label
    if (!newField.label.trim()) {
      alert('Please enter field label');
      return;
    }
    // guard: options when required
    if (needsOptions(newField.type) && (!newField.options || newField.options.length === 0)) {
      alert('Please add at least one option');
      return;
    }
    dispatch(addField(newField));
    setNewField(defaultNewField); // reset inputs
  };

  // save schema to localStorage (as per assignment)
  const handleSave = () => {
    // ask for name if empty
    let name = formName.trim();
    if (!name) {
      name = prompt('Enter form name')?.trim() || '';
      if (!name) return;
      dispatch(setFormName(name));
    }

    // package payload
    const payload = {
      id: crypto.randomUUID(),
      formName: name,
      fields,
      createdAt: new Date().toISOString(),
    };

    // read current list → append → save
    const raw = localStorage.getItem('forms');
    const list = raw ? JSON.parse(raw) : [];
    list.push(payload);
    localStorage.setItem('forms', JSON.stringify(list));

    alert('Form saved!');
  };

  // reset schema quickly
  const handleReset = () => {
    if (confirm('Clear current builder?')) {
      dispatch(resetForm());
      setNewField(defaultNewField);
    }
  };

  // open dialog for a field
  const openEditor = (f: FormField) => {
    setEditing(f);
    setEditOpen(true);
  };

  // when editor saves, dispatch update
  const handleEditorSave = (updated: FormField) => {
    dispatch(updateField(updated));
    setEditOpen(false);
    setEditing(null);
  };

  // placeholder for options input
  const optionsPlaceholder = useMemo(
    () => (needsOptions(newField.type) ? 'Comma separated (e.g., Small, Medium, Large)' : ''),
    [newField.type]
  );

  return (
    <Box p={3} maxWidth={1100} mx="auto">
      {/* top bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Create Form</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleReset}>Reset</Button>
          <Button variant="contained" onClick={handleSave}>Save Form</Button>
        </Stack>
      </Stack>

      {/* form name */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>Form Name</Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Enter form name"
          value={formName}
          onChange={(e) => dispatch(setFormName(e.target.value))}
        />
      </Paper>

      {/* add field section */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>Add Field</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* type */}
          <Box sx={{ minWidth: 180 }}>
            <Typography variant="caption" display="block" mb={0.5}>Type</Typography>
            <Select
              size="small"
              fullWidth
              value={newField.type}
              onChange={(e) =>
                setNewField((f) => ({ ...f, type: e.target.value as FormField['type'], options: [] }))
              }
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="textarea">Textarea</MenuItem>
              <MenuItem value="select">Select</MenuItem>
              <MenuItem value="radio">Radio</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
          </Box>

          {/* label */}
          <Box flex={1}>
            <Typography variant="caption" display="block" mb={0.5}>Label</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Field label (e.g., Email)"
              value={newField.label}
              onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))}
            />
          </Box>

          {/* default */}
          <Box flex={1}>
            <Typography variant="caption" display="block" mb={0.5}>Default Value</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Optional"
              value={newField.defaultValue || ''}
              onChange={(e) => setNewField((f) => ({ ...f, defaultValue: e.target.value }))}
            />
          </Box>

          {/* required */}
          <Box>
            <Typography variant="caption" display="block" mb={0.5}>Required</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={!!newField.validations?.required}
                  onChange={(e) =>
                    setNewField((f) => ({
                      ...f,
                      validations: { ...(f.validations || {}), required: e.target.checked },
                    }))
                  }
                />
              }
              label=""
            />
          </Box>
        </Stack>

        {/* options if needed */}
        {needsOptions(newField.type) && (
          <Box mt={2}>
            <Typography variant="caption" display="block" mb={0.5}>Options</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={optionsPlaceholder}
              value={(newField.options || []).join(', ')}
              onChange={(e) =>
                setNewField((f) => ({
                  ...f,
                  options: e.target.value
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
            />
          </Box>
        )}

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={handleAddField}>Add Field</Button>
        </Stack>
      </Paper>

      {/* field list */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>Fields</Typography>
        <Divider sx={{ my: 2 }} />

        {fields.length === 0 ? (
          <Typography color="text.secondary">No fields yet. Add your first field above.</Typography>
        ) : (
          <Stack spacing={1}>
            {fields.map((f, idx) => (
              <Paper key={f.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
                  {/* summary */}
                  <Box>
                    <Typography fontWeight={600}>{f.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Type: {f.type}
                      {f.validations?.required ? ' • Required' : ''}
                      {needsOptions(f.type) && f.options?.length ? ` • Options: ${f.options.join(', ')}` : ''}
                      {f.derived?.isDerived ? ' • Derived' : ''}
                    </Typography>
                  </Box>

                  {/* actions */}
                  <Stack direction="row" spacing={1}>
                    {/* edit */}
                    <IconButton size="small" onClick={() => openEditor(f)}>
                      <EditIcon fontSize="small" />
                    </IconButton>

                    {/* up */}
                    <IconButton
                      size="small"
                      disabled={!canMoveUp(idx)}
                      onClick={() => dispatch(moveField({ fromIndex: idx, toIndex: idx - 1 }))}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>

                    {/* down */}
                    <IconButton
                      size="small"
                      disabled={!canMoveDown(idx)}
                      onClick={() => dispatch(moveField({ fromIndex: idx, toIndex: idx + 1 }))}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>

                    {/* delete */}
                    <IconButton size="small" onClick={() => dispatch(deleteField(f.id))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* editor dialog */}
      {editing && (
        <FieldEditor
          open={editOpen}
          field={editing}
          allFields={fields}
          onClose={() => { setEditOpen(false); setEditing(null); }}
          onSave={handleEditorSave}
        />
      )}
    </Box>
  );
};

export default FormBuilder;
