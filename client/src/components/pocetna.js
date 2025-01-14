import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chat from "./chat.js";
import Map from "./map.js";
import "../styles/pocetna/pocetna.css";
import "../styles/pocetna/weather.css";

function Pocetna({ handleLogout }) {
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [chatError, setChatError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
        setWeather(response.data.weather);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleAdminButtonClick = () => {
    navigate("/info/admin-menu");
  };

  const handleRepositoryButtonClick = () => {
    navigate("/auth/repository");
  };

  const handleMapButtonClick = () => {
    navigate("/auth/map");
  };

  return (
    <div className="pocetna-container">
      {user &&
        (user.role === "pending" ? (
          <div>
            <div className="user-container">
              <h1>
                Bok, {user.name} {user.surname}!
              </h1>
            </div>
            <h1 className="info-text">Niste još prihvaćeni.</h1>
          </div>
        ) : user.role === "denied" ? (
          <div>
            <h1 className="info-text">Niste prihvaćeni!</h1>
          </div>
        ) : (
          <>
            <div className="chat-container">
              {chatError ? (
                <p>Ne radi. 😔</p>
              ) : (
                <Chat 
                  user={user}
                  onError={() => {
                    setChatError(true);
                  }} 
                />
              )}
            </div>
            <button
              className="map-gumb"
              onClick={handleMapButtonClick}
            >
              MAP
            </button>
            <div>
              <div className="user-container">
                <h1>
                  Bok, {user.name} {user.surname}!
                </h1>
                <p>Prijava uspješna.</p>
              </div>

              {user.role === "admin" ? (
                <div>
                  <div>
                    <button
                      className="admin-gumb"
                      onClick={handleAdminButtonClick}
                    >
                      ADMIN GUMB
                    </button>
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              {weather ? (
                <div className="weather-container">
                  <div className="weather-city">
                    <h2>{weather.city}</h2>
                    <p>{weather.country}</p>
                  </div>
                  <div className="weather-icon">
                    <img
                      src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.description}
                    ></img>
                  </div>
                  <div className="weather-temp">
                    <h2>{weather.temperature}°C</h2>
                    <p>{weather.description}</p>
                  </div>
                </div>
              ) : (
                <div className="weather-container">
                  <p>Greška: podatci o vremenu su nedostupni.</p>
                </div>
              )}
              <button
                className="repository-gumb"
                onClick={handleRepositoryButtonClick}
              >
                REPOZITORIJ
              </button>
            </div>
          </>
        ))}
    </div>
  );
}
export default Pocetna;
