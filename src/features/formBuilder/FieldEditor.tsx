// A reusable dialog to edit a single FormField
// - Supports: label, type, required, default, options
// - Validations: minLength, maxLength, email, passwordRule
// - Derived: toggle, choose parent fields, write formula
// - Emits the updated field via onSave(updated)

import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import type { FormField, FieldType } from '../types/form.types';

// Utility: which types need options
const needsOptions = (t: FieldType) => ['select', 'radio', 'checkbox'].includes(t);

// Props contract
type Props = {
  open: boolean;                // show/hide dialog
  field: FormField;             // field being edited
  allFields: FormField[];       // for derived parent selection
  onClose: () => void;          // close without saving
  onSave: (updated: FormField) => void; // return updated field
};

const FieldEditor: React.FC<Props> = ({ open, field, allFields, onClose, onSave }) => {
  // Local copy of field state (so we don't mutate Redux directly)
  const [local, setLocal] = useState<FormField>(field);

  // Keep local in sync when "field" prop changes (open another field quickly)
  useEffect(() => {
    setLocal(field);
  }, [field]);

  // Placeholder text for options
  const optionsPlaceholder = useMemo(
    () => (needsOptions(local.type) ? 'Comma separated (e.g., Small, Medium, Large)' : ''),
    [local.type]
  );

  // Apply save with small guards
  const handleSave = () => {
    // Basic guard: label must exist
    if (!local.label.trim()) {
      alert('Label is required');
      return;
    }
    // Options required when needed
    if (needsOptions(local.type) && (!local.options || local.options.length === 0)) {
      alert('Add at least one option');
      return;
    }
    // If derived enabled but no parents or formula
    if (local.derived?.isDerived) {
      if (!local.derived.parents?.length) {
        alert('Select at least one parent for derived field');
        return;
      }
      if (!local.derived.formula?.trim()) {
        alert('Provide a formula for derived field');
        return;
      }
    }
    onSave(local); // return updated field
  };

  // List of possible parents = all fields except this one
  const parentChoices = useMemo(
    () => allFields.filter(f => f.id !== local.id),
    [allFields, local.id]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Field</DialogTitle>

      <DialogContent>
        {/* Top row: Type, Label, Default, Required */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={1}>
          {/* Type selector */}
          <Box sx={{ minWidth: 180 }}>
            <Typography variant="caption" display="block" mb={0.5}>Type</Typography>
            <Select
              size="small"
              fullWidth
              value={local.type}
              onChange={(e) => {
                const nextType = e.target.value as FieldType;
                setLocal((s) => ({
                  ...s,
                  type: nextType,
                  // reset options when switching away
                  options: needsOptions(nextType) ? (s.options || []) : [],
                }));
              }}
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

          {/* Label */}
          <Box flex={1}>
            <Typography variant="caption" display="block" mb={0.5}>Label</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g., Email"
              value={local.label}
              onChange={(e) => setLocal((s) => ({ ...s, label: e.target.value }))}
            />
          </Box>

          {/* Default value */}
          <Box flex={1}>
            <Typography variant="caption" display="block" mb={0.5}>Default Value</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Optional"
              value={local.defaultValue ?? ''}
              onChange={(e) => setLocal((s) => ({ ...s, defaultValue: e.target.value }))}
            />
          </Box>

          {/* Required toggle */}
          <Box>
            <Typography variant="caption" display="block" mb={0.5}>Required</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={!!local.validations?.required}
                  onChange={(e) =>
                    setLocal((s) => ({
                      ...s,
                      validations: { ...(s.validations || {}), required: e.target.checked },
                    }))
                  }
                />
              }
              label=""
            />
          </Box>
        </Stack>

        {/* Options input when needed */}
        {needsOptions(local.type) && (
          <Box mt={2}>
            <Typography variant="caption" display="block" mb={0.5}>Options</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={optionsPlaceholder}
              value={(local.options || []).join(', ')}
              onChange={(e) =>
                setLocal((s) => ({
                  ...s,
                  options: e.target.value
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
            />
          </Box>
        )}

        {/* Validation settings */}
        <Box mt={3}>
          <Typography fontWeight={700} mb={1}>Validation</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* Min Length */}
            <TextField
              type="number"
              size="small"
              label="Min Length"
              value={local.validations?.minLength ?? ''}
              onChange={(e) =>
                setLocal((s) => ({
                  ...s,
                  validations: {
                    ...(s.validations || {}),
                    minLength: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                }))
              }
            />
            {/* Max Length */}
            <TextField
              type="number"
              size="small"
              label="Max Length"
              value={local.validations?.maxLength ?? ''}
              onChange={(e) =>
                setLocal((s) => ({
                  ...s,
                  validations: {
                    ...(s.validations || {}),
                    maxLength: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                }))
              }
            />
            {/* Email rule */}
            <FormControlLabel
              control={
                <Switch
                  checked={!!local.validations?.email}
                  onChange={(e) =>
                    setLocal((s) => ({
                      ...s,
                      validations: { ...(s.validations || {}), email: e.target.checked },
                    }))
                  }
                />
              }
              label="Email format"
            />
            {/* Password rule */}
            <FormControlLabel
              control={
                <Switch
                  checked={!!local.validations?.passwordRule}
                  onChange={(e) =>
                    setLocal((s) => ({
                      ...s,
                      validations: { ...(s.validations || {}), passwordRule: e.target.checked },
                    }))
                  }
                />
              }
              label="Password rule"
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Password rule = min 8 chars & at least 1 number (we’ll enforce in validators).
          </Typography>
        </Box>

        {/* Derived field settings */}
        <Box mt={3}>
          <Typography fontWeight={700} mb={1}>Derived Field</Typography>

          {/* Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={!!local.derived?.isDerived}
                onChange={(e) =>
                  setLocal((s) => ({
                    ...s,
                    derived: {
                      isDerived: e.target.checked,
                      parents: e.target.checked ? (s.derived?.parents || []) : [],
                      formula: e.target.checked ? (s.derived?.formula || '') : '',
                    },
                  }))
                }
              />
            }
            label="Enable derived value"
          />

          {/* Parents multi-select style via chips */}
          {local.derived?.isDerived && (
            <>
              <Typography variant="caption" display="block" mt={1} mb={0.5}>
                Select parent fields (click to toggle)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {parentChoices.map((p) => {
                  const active = local.derived?.parents?.includes(p.id);
                  return (
                    <Chip
                      key={p.id}
                      label={p.label}
                      color={active ? 'primary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      onClick={() => {
                        setLocal((s) => {
                          const curr = new Set(s.derived?.parents || []);
                          if (curr.has(p.id)) curr.delete(p.id);
                          else curr.add(p.id);
                          return {
                            ...s,
                            derived: {
                              ...(s.derived || { isDerived: true, parents: [], formula: '' }),
                              parents: Array.from(curr),
                            },
                          };
                        });
                      }}
                    />
                  );
                })}
              </Stack>

              {/* Formula editor */}
              <Box mt={2}>
                <Typography variant="caption" display="block" mb={0.5}>
                  Formula (JS). Example: <b>(Date.now() - new Date(DOB).getTime()) / (365*24*3600*1000)</b>
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Use parent labels or safe identifiers you will map in preview."
                  value={local.derived?.formula || ''}
                  onChange={(e) =>
                    setLocal((s) => ({
                      ...s,
                      derived: {
                        ...(s.derived || { isDerived: true, parents: [], formula: '' }),
                        formula: e.target.value,
                      },
                    }))
                  }
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldEditor;
