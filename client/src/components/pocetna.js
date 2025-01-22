import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chat from "./chat.js";
import Raspored from "./raspored.js";
import "../styles/pocetna/pocetna.css";
import "../styles/pocetna/weather.css";

function Pocetna({handleLogout}) {
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
  
  const handleLogoutButtonClick = () => {
    window.location.href = "http://localhost:3000/auth/logout";
  };

  const handleIzostanakButtonClick = () => {
    navigate("/auth/izostanci");
  };

  const handleObavijestiButtonClick = () => {
    navigate("/auth/obavijesti");
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
            <div className = "pocetna-heder">
              <div className="user-container">
                <h1>
                  Bok, {user.name} {user.surname}!
                </h1>
              </div>
              <button
                className="map-gumb"
                onClick={handleMapButtonClick}>MAP
              </button>
              <button
                className="repository-gumb"
                onClick={handleRepositoryButtonClick}>REPOZITORIJ
              </button>
              <button
                className="obavijesti-gumb"
                onClick={handleObavijestiButtonClick}>OBAVIJESTI
              </button>
              <button
                className="logout-gumb"
                onClick={handleLogoutButtonClick}>LOGOUT
              </button>
              {user.role !== "učenik" ? (
                <div>
                  <div>
                    <button
                      className="izostanak-gumb"
                      onClick={handleIzostanakButtonClick}
                    >
                      IZOSTANCI
                    </button>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
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
            </div>

            <div className = "pocetna-sredina">
              <div className = "raspored">
                <Raspored/>
              </div>
              <div className = "desno">
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
                <div className="chat-container">
                  {(chatError || user.role === "admin") ? (
                    <p className = "ne-radi">Ne radi. 😔</p>
                  ) : (
                    <Chat 
                      user={user}
                      onError={() => {
                        setChatError(true);
                      }} 
                    />
                )}
                </div>
              </div>
            </div>
          </>
        ))}
    </div>
  );
}
export default Pocetna;
