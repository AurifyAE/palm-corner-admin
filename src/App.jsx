// App.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Layout from './components/layout/index';

const App = () => {
  const location = useLocation();
  const showLayout = !['/login', '/'].includes(location.pathname);
  const showOutlet = ['/login', '/'].includes(location.pathname);

  return (
    <>
      {showLayout && <Layout />}
      {showOutlet && <Outlet />}
    </>
  );
};

export default App;