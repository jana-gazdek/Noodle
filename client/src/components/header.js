import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";

function Header({ user = {}, handleLogout }) {
  const navigate = useNavigate();

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

  return (
    <header className="main-header">
      <div className="logo">
        <a href="/">
          <img src="/images/logo.jpeg" alt="Logo" />
        </a>
      </div>

      <nav className="navigation">
        <button onClick={handleMapButtonClick}>Karta</button>
        <button onClick={handleRepositoryButtonClick}>Repozitorij</button>
        <button onClick={handleIzostanakButtonClick}>Izostanci</button>
        {user.role === "admin" && (
          <button onClick={handleAdminButtonClick}>Admin Gumb</button>
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
