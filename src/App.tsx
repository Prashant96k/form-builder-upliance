import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Stack, Button } from '@mui/material';
import AppRoutes from 'routes/AppRoutes';
import { ROUTES } from 'app/constants';
import Header from 'components/Header';

const App: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <Box>
      {/* App title bar */}
      <Header />

      {/* Navigation below header */}
      <Stack direction="row" spacing={1} p={2} borderBottom="1px solid #eee">
        <Button
          component={Link}
          to={ROUTES.create}
          variant={pathname === ROUTES.create ? 'contained' : 'text'}
        >
          Create
        </Button>
        <Button
          component={Link}
          to={ROUTES.previewRoot}
          variant={pathname.startsWith(ROUTES.previewRoot) ? 'contained' : 'text'}
        >
          Preview
        </Button>
        <Button
          component={Link}
          to={ROUTES.myForms}
          variant={pathname === ROUTES.myForms ? 'contained' : 'text'}
        >
          My Forms
        </Button>
      </Stack>

      {/* Routed pages */}
      <AppRoutes />
    </Box>
  );
};

export default App;
