// Single source of truth for keys, routes, etc.
export const LS_FORMS_KEY = 'forms';

export const ROUTES = {
  create: '/create',
  previewRoot: '/preview',
  previewById: (id: string) => `/preview/${id}`,
  myForms: '/myforms',
} as const;
