import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
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
      .get('https://noodle-x652.onrender.com/auth/pocetna', { withCredentials: true })
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
    window.location.href = 'https://noodle-x652.onrender.com/auth/google';
  };

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/auth/pocetna" /> : <Login handleGoogleLogin={handleGoogleLogin} />
            }
          />
          
          <Route
            path="/auth/pocetna"
            element={
              isAuthenticated ? <Pocetna /> : <Navigate to="/login" />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
