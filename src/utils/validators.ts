// Central validation helpers

import type { FormField } from 'features/types/form.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passOk = (v: string) => v.length >= 8 && /\d/.test(v);

export function validateValueForField(value: string, field: FormField): string[] {
  const v = field.validations || {};
  const errors: string[] = [];
  const val = value ?? '';

  if (v.required && !val.trim()) {
    errors.push(`${field.label} is required`);
    return errors;
  }
  if (v.minLength !== undefined && val.length < v.minLength) {
    errors.push(`${field.label} must be at least ${v.minLength} characters`);
  }
  if (v.maxLength !== undefined && val.length > v.maxLength) {
    errors.push(`${field.label} must be at most ${v.maxLength} characters`);
  }
  if (v.email && val && !EMAIL_RE.test(val)) {
    errors.push(`${field.label} must be a valid email`);
  }
  if (v.passwordRule && val && !passOk(val)) {
    errors.push(`${field.label} must have 8+ chars incl. a number`);
  }
  return errors;
}

export function validateAll(
  fields: FormField[],
  values: Record<string, string>
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const f of fields) {
    result[f.id] = validateValueForField(values[f.id] ?? '', f);
  }
  return result;
}
