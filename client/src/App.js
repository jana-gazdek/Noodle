import React, { useEffect, useState } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate
} from 'react-router-dom';
import Pocetna from './components/pocetna';
import Login from './components/login';
import axios from 'axios';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/auth/pocetna', { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  if (isAuthenticated === null) {
    return null;
  }

  const router = createBrowserRouter([
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/auth/pocetna" /> : <Login handleGoogleLogin={handleGoogleLogin} />,
    },
    {
      path: '/auth/pocetna',
      element: isAuthenticated ? <Pocetna /> : <Navigate to="/login" />,
    },
    {
      path: '*',
      element: <Navigate to="/login" />,
    },
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
