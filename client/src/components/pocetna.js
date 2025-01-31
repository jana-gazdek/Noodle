import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chat from "./chat.js";
import Raspored from "./raspored.js";
import "../styles/pocetna/pocetna.css";
import "../styles/pocetna/weather.css";
import Header from "./header.js";


function Pocetna({handleLogout}) {
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [chatError, setChatError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://noodle-x652.onrender.com/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
        setWeather(response.data.weather);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

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
            <Header
              user={user}
              handleLogout={() => {
                window.location.href = "https://noodle-x652.onrender.com/auth/logout";
              }}
            />


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
                  <div className="weather-container-pocetna">
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