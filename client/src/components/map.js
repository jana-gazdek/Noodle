import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";
import "../styles/header.css";
import Header from "../components/header";
import axios from "axios";

const Map = () => {
  const [startCity, setStartCity] = useState("");
  const [endCity, setEndCity] = useState("");
  const [route, setRoute] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => {
      });
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3005/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startCity, endCity }),
      });

      const data = await response.json();

      if (data.decodedGeometry && data.decodedGeometry.length > 0) {
        setRoute(data.decodedGeometry);
      } else {
        alert(
          "Could not find a route. Please check the city names and try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching the route.");
    }
  };

  return (
    <div>
      {(user) && (
        <Header
        user={user}
        handleLogout={() => {
        window.location.href = "http://localhost:3000/auth/logout";
        }}
        />
      )}
      <form className="route-form" onSubmit={handleFormSubmit}>
        <div className="route-form-gornji">
          <label id="start-city">
            Početak:
            <input
              type="text"
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              required
            />
          </label>
          <label className="crtica"> - </label>
          <label id="end-city">
            Kraj:
            <input
              type="text"
              value={endCity}
              onChange={(e) => setEndCity(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Pronađi rutu</button>
      </form>

      <MapContainer center={[44.8, 16]} zoom={7} className="map-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {route && <RoutePolyline route={route} />}
      </MapContainer>
    </div>
  );
};

const RoutePolyline = ({ route }) => {
  const map = useMap();

  React.useEffect(() => {
    const bounds = route.map(([lat, lon]) => [lat, lon]);
    map.fitBounds(bounds);
  }, [route, map]);

  return <Polyline positions={route} color="#8860D0" />;
};

export default Map;
