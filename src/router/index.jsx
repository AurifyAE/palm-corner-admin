// src/router/index.jsx
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ProductManagement from '../pages/ProductManagement';
import CategoryManagement from '../pages/CategoryManagement';
import Login from '../pages/Login';
import ErrorPage from '../pages/ErrorPage'; // Create this component

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const Router = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route
        path="/product-management"
        element={
          <ProtectedRoute>
            <ProductManagement errorElement={<ErrorPage />} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/category-management"
        element={
          <ProtectedRoute>
            <CategoryManagement errorElement={<ErrorPage />} />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/product-management" replace />} />
      
      {/* Error Handling */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Router;