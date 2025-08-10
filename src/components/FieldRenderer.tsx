// src/components/FieldRenderer.tsx
// Renders a single field based on type with basic MUI controls

import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
} from '@mui/material';
import type { FormField } from 'features/types/form.types';

type Props = {
  field: FormField;                  // schema
  value: string;                     // current value
  errors?: string[];                 // validation errors
  onChange: (val: string) => void;   // setter
};

const FieldRenderer: React.FC<Props> = ({ field, value, errors = [], onChange }) => {
  const error = errors.length > 0;
  const isDerived = !!field.derived?.isDerived;
  const helper = error
    ? errors[0]
    : isDerived
    ? 'Derived field'
    : field.defaultValue
    ? `Default: ${field.defaultValue}`
    : '';

  switch (field.type) {
    case 'text':
    case 'number':
    case 'date':
      return (
        <TextField
          fullWidth
          type={field.type}
          label={field.label}
          value={value}
          required={!!field.validations?.required}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          helperText={helper}
          disabled={isDerived}
          inputProps={field.type === 'number' ? { inputMode: 'numeric' } : undefined}
        />
      );

    case 'textarea':
      return (
        <TextField
          fullWidth
          multiline
          minRows={3}
          label={field.label}
          value={value}
          required={!!field.validations?.required}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          helperText={helper}
          disabled={isDerived}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth error={error} disabled={isDerived}>
          <FormLabel required={!!field.validations?.required}>{field.label}</FormLabel>
          <Select
            value={value}
            onChange={(e) => onChange(String(e.target.value))}
            displayEmpty
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {(field.options || []).map((o) => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl error={error} disabled={isDerived}>
          <FormLabel required={!!field.validations?.required}>{field.label}</FormLabel>
          <RadioGroup
            value={value}
            onChange={(e) => onChange(e.target.value)}
            row
          >
            {(field.options || []).map((o) => (
              <FormControlLabel key={o} value={o} control={<Radio />} label={o} />
            ))}
          </RadioGroup>
        </FormControl>
      );

    case 'checkbox': {
      // CSV storage for multi-select
      const selected = new Set((value || '').split(',').filter(Boolean));
      const toggle = (opt: string) => {
        const next = new Set(selected);
        next.has(opt) ? next.delete(opt) : next.add(opt);
        onChange(Array.from(next).join(','));
      };
      return (
        <FormControl error={error} disabled={isDerived}>
          <FormLabel required={!!field.validations?.required}>{field.label}</FormLabel>
          {(field.options || []).map((o) => (
            <FormControlLabel
              key={o}
              control={<Checkbox checked={selected.has(o)} onChange={() => toggle(o)} />}
              label={o}
            />
          ))}
        </FormControl>
      );
    }

    default:
      return null;
  }
};

export default FieldRenderer;
