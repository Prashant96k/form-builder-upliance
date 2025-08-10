// Lists saved forms from localStorage and opens /preview/:id
// Uses alias imports and 'import type' for type-only symbols.

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// LocalStorage key (single source of truth)
import { LS_FORMS_KEY } from 'app/constants';

// Type-only import for stronger typing without runtime weight
import type { FormField } from 'features/types/form.types';

// Shape of one saved form entry in localStorage
type SavedForm = {
  id: string;
  formName: string;
  fields: FormField[];
  createdAt: string;
};

const MyForms: React.FC = () => {
  const navigate = useNavigate();

  // Local state to hold saved forms list
  const [forms, setForms] = useState<SavedForm[]>([]);

  // Load forms on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_FORMS_KEY);
      setForms(raw ? (JSON.parse(raw) as SavedForm[]) : []);
    } catch {
      setForms([]);
    }
  }, []);

  // Optional: handy refresh in case user manipulates localStorage elsewhere
  const refresh = () => {
    const raw = localStorage.getItem(LS_FORMS_KEY);
    setForms(raw ? (JSON.parse(raw) as SavedForm[]) : []);
  };

  // Navigate to preview for selected form
  const openPreview = (id: string) => {
    navigate(`/preview/${id}`);
  };

  return (
    <Box p={3} maxWidth={900} mx="auto">
      {/* Page title + Refresh */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>My Forms</Typography>
        <Button onClick={refresh}>Refresh</Button>
      </Stack>

      {/* Empty state */}
      {!forms.length ? (
        <Typography color="text.secondary">No saved forms yet.</Typography>
      ) : (
        // List of saved forms
        <Stack spacing={1}>
          {forms.map((f) => (
            <Paper key={f.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                {/* Left: name + created date */}
                <Box>
                  <Typography fontWeight={700}>{f.formName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(f.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {/* Right: open preview */}
                <Button variant="contained" onClick={() => openPreview(f.id)}>
                  Open Preview
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MyForms;
