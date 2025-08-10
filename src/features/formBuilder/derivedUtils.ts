// Compute derived values using a formula string with a context of parent values
// Safe-ish eval: only exposes ctx (byId/byLabel) + Math/Date/Number/String/parseInt/parseFloat

// Compute derived values using a formula string with a context of parent values
// Safe-ish eval: only exposes ctx (byId/byLabel) + Math/Date/Number/String/parseInt/parseFloat
import type { FormField } from 'features/types/form.types';

type Values = Record<string, string>;

function buildContext(fields: FormField[], values: Values) {
  const byId: Record<string, string> = {};
  const byLabel: Record<string, string> = {};
  for (const f of fields) {
    const v = values[f.id] ?? '';
    byId[f.id] = v;
    byLabel[f.label] = v; // be careful with duplicate labels
  }
  // Expose some globals for formulas
  return {
    byId,
    byLabel,
    Math,
    Date,
    Number,
    String,
    parseInt,
    parseFloat,
  };
}

// Evaluate a single formula: with(ctx){ return (<formula>); }
function evaluateFormula(formula: string, ctx: any): string {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('ctx', `with(ctx){ return (${formula}); }`);
    const out = fn(ctx);
    return out == null ? '' : String(out);
  } catch (e) {
    console.warn('Derived formula error:', e);
    return '';
  }
}

// Compute all derived fields given current values
export function computeDerived(fields: FormField[], values: Values): Values {
  const result: Values = {};
  const ctx = buildContext(fields, values);
  for (const f of fields) {
    if (f.derived?.isDerived && f.derived.formula) {
      result[f.id] = evaluateFormula(f.derived.formula, ctx);
    }
  }
  return result;
}
