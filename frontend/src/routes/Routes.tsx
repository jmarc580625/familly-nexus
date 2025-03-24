import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Photos from '../pages/Photos';
import Upload from '../pages/Upload';
import Search from '../pages/Search';

const Routes: React.FC = () => {
  return (
    <RouterRoutes>
      <Route path="/photos" element={<Photos />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/search" element={<Search />} />
      <Route path="/" element={<Navigate to="/photos" replace />} />
    </RouterRoutes>
  );
};

export default Routes;
