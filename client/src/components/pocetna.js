import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/pocetna/pocetna.css';
import '../styles/pocetna/weather.css';

function Pocetna({ handleLogout }) {
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/auth/pocetna', { withCredentials: true })
      .then(response => {
        setUser(response.data.user);
        setWeather(response.data.weather);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  return (
    <div className="pocetna-container">
      {user && (
        <>
          <div className="user-container">
            <h1>Bok, {user.name} {user.surname}!</h1>
            <p>Prijava uspješna.</p>
          </div>

          {weather ? (
            <div className="weather-container" >
              <div className="weather-city">
                <h2>{weather.city}</h2>
                <p>{weather.country}</p>
              </div>
              <div className="weather-icon">
                <img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} ></img>
              </div>
              <div className="weather-temp">
                <h2>{weather.temperature}°C</h2>
                <p>{weather.description}</p>
              </div>
            </div>
          ) : (
            <div className="weather-container" >
              <p>Greška: podatci o vremenu su nedostupni.</p>
            </div> 
          )}
        </>
      )}


    </div>
  );
}
export default Pocetna;
