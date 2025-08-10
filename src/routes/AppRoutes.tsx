import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import FormBuilder from 'features/formBuilder/FormBuilder';
import FormPreview from 'features/preview/FormPreview';
import MyForms from 'features/myForms/MyForms';
import { ROUTES } from 'app/constants';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.create} />} />
      <Route path={ROUTES.create} element={<FormBuilder />} />
      <Route path={ROUTES.previewRoot} element={<FormPreview />} />
      <Route path={`${ROUTES.previewRoot}/:id`} element={<FormPreview />} />
      <Route path={ROUTES.myForms} element={<MyForms />} />
      <Route path="*" element={<Navigate to={ROUTES.create} />} />
    </Routes>
  );
};

export default AppRoutes;
