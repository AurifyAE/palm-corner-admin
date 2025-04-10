// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import App from './App';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import './index.css';
import { Toaster } from 'react-hot-toast'; // Add this import for toast notifications

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true, // Add a default route
        element: <Navigate to="/login" />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'product-management',
        element: <ProductManagement />,
        // Add this for protected routes
        loader: () => {
          if (!localStorage.getItem('isAuthenticated')) {
            throw new Response('Unauthorized', { status: 401 });
          }
          return null;
        }
      },
      {
        path: 'category-management',
        element: <CategoryManagement />,
        loader: () => {
          if (!localStorage.getItem('isAuthenticated')) {
            throw new Response('Unauthorized', { status: 401 });
          }
          return null;
        }
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" /> {/* Add Toaster component for notifications */}
  </React.StrictMode>
);