// ErrorPage.jsx
import { useRouteError, Navigate } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  
  // Handle authentication errors
  if (error.status === 401) {
    // Clear authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    // Store the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-xl text-gray-700 mb-4">
          {error?.statusText || error?.message || 'An unexpected error occurred'}
        </p>
        <p className="text-gray-600">
          Error code: {error?.status || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;