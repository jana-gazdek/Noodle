import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";
import axios from 'axios';

function Header({ user = {}, handleLogout, selectedPage }) {
  const navigate = useNavigate();
  const [poruka, setPoruka] = useState("");

  const handleAdminButtonClick = () => {
    navigate("/info/admin-menu");
  };

  const handleRepositoryButtonClick = () => {
    navigate("/auth/repository");
  };

  const handleMapButtonClick = () => {
    navigate("/auth/map");
  };

  const handleIzostanakButtonClick = () => {
    navigate("/auth/izostanci");
  };

  const handleObavijestiButtonClick = () => {
    navigate("/auth/obavijesti");
  };

  const handleSatnicarButtonClick = () => {
    navigate("/info/satnicar-menu");
  };

  const handleUcenikButtonClick = async (id) => {
    try {
      const response = await axios.post('https://noodle-x652.onrender.com/potvrda/izdavanje-potvrde', {googleId : id}, { withCredentials: true });
      setPoruka(response.data)
      alert('Potvrda uspješno poslana.');
    } catch (error) {
      console.error("Error sending potvrda:", error.message);
    }
  };

  return (
    <header className="main-header">
      <div className="logo">
        <a href="/">
          <img src="/images/logo.jpeg" alt="Logo" />
        </a>
      </div>

      <nav className="navigation">
        <button className="navigation-button" onClick={handleMapButtonClick} style={{ textDecoration: selectedPage === "Karta" ? "underline" : "none" }}>Karta</button>
        <button className="navigation-button" onClick={handleRepositoryButtonClick } style={{ textDecoration: selectedPage === "Repozitorij" ? "underline" : "none" }}>Repozitorij</button>
        {user.role !== "učenik" && (
        <button className="navigation-button" onClick={handleIzostanakButtonClick} style={{ textDecoration: selectedPage === "Izostanci" ? "underline" : "none" }}>Izostanci</button>
        )}
        <button className="navigation-button" onClick={handleObavijestiButtonClick} style={{ textDecoration: selectedPage === "Obavijesti" ? "underline" : "none" }}>Obavijesti</button>
        {user.role === "učenik" && (
          <button className="navigation-button" onClick={() => handleUcenikButtonClick(user.googleId)}>Potvrda</button>
        )}
        {user.role === "satničar" && (
          <button className="navigation-button" onClick={handleSatnicarButtonClick} style={{ textDecoration: selectedPage === "Satničar" ? "underline" : "none" }}>Satničar</button>
        )}
        {user.role === "admin" && (
          <button className="navigation-button" onClick={handleAdminButtonClick} style={{ textDecoration: selectedPage === "Admin" ? "underline" : "none" }}>Admin</button>
        )}
      </nav>
      <div className="user-info">
        <span className="user-name">
          {user.name || "Gost"} {user.surname ? user.surname.charAt(0) : ""}.
        </span>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
}

export default Header;