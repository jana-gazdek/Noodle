import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

const Map = () => {
  const [startCity, setStartCity] = useState("");
  const [endCity, setEndCity] = useState("");
  const [route, setRoute] = useState(null);
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate("/auth/pocetna");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://noodle-map.onrender.com/route", {
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
      <h1>Karta</h1>
      <form className="route-form" onSubmit={handleFormSubmit}>
        <label>
          Početak:
          <input
            type="text"
            value={startCity}
            onChange={(e) => setStartCity(e.target.value)}
            required
          />
        </label>
        <label>
          Kraj:
          <input
            type="text"
            value={endCity}
            onChange={(e) => setEndCity(e.target.value)}
            required
          />
        </label>
        <button type="submit">Pronađi rutu</button>
        <button className="back-button" onClick={handleBackButtonClick}>
          Nazad
        </button>
      </form>

      <MapContainer center={[0, 0]} zoom={2} className="map-container">
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
