import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Pocetna({ handleLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/auth/pocetna', { withCredentials: true })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  return (
    <div className="pocetna-container">
      {user && (
        <>
          <h1>Bok, {user.name.givenName} {user.name.familyName}!</h1>
          <p>Prijava uspješna.</p>
        </>
      )}
    </div>
  );
}

export default Pocetna;
