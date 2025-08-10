// Strong TS types for the form builder

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  passwordRule?: boolean; // >= 8 chars + at least 1 number
}

export interface DerivedFieldConfig {
  isDerived: boolean;   // field auto-computed?
  parents: string[];    // parent field IDs
  formula: string;      // JS expression string (evaluated in preview)
}

export interface FormField {
  id: string;                 // unique ID (uuid)
  label: string;              // field label
  type: FieldType;            // input type
  options?: string[];         // for select/radio/checkbox
  defaultValue?: string;      // initial value
  validations?: ValidationRule;
  derived?: DerivedFieldConfig;
}
