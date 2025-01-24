import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin_menu.css";
import "../styles/header.css";
import Header from "../components/header";
import axios from "axios";

function InfoForm() {
  const [oib, setOib] = useState("");
  const [oib_predmet, setOibPredmet] = useState("");
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleRequestButtonClick = () => {
    navigate("/info/admin-menu/requests");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (oib.trim()) {
      navigate(`/info/admin-menu/profile/${oib}`);
    }
  };

  const handleProstorijeButtonClick = () => {
    navigate("/info/admin-menu/prostorije");
  };

  const handlePredmetSearch = (e) => {
    e.preventDefault();
    if (oib_predmet.trim()) {
      navigate(`/info/admin-menu/predmet/${oib_predmet}`);
    }
  };

  const handleBackButtonClick = () => {
    navigate("/auth/pocetna");
  };

  return (
    <div className="menu-container">
      {user && (
        <Header
          user={user}
          handleLogout={() => {
            window.location.href = "http://localhost:3000/auth/logout";
          }}
          selectedPage = "Admin"
        />
      )}
      <h1>Admin izbornik</h1>
      <button className="req-button" onClick={handleRequestButtonClick}>
        Zahtjevi
      </button>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="menu-input"
          placeholder="Upiši OIB korisnika"
          value={oib}
          onChange={(e) => setOib(e.target.value)}
          required
        />
        <button className="req-button" type="submit">
          Pretraži
        </button>
      </form>
      <button className="req-button" onClick={handleProstorijeButtonClick}>
        Prostorije
      </button>
      <form onSubmit={handlePredmetSearch}>
        <input
          type="text"
          className="menu-input"
          placeholder="Upiši OIB profesora"
          value={oib_predmet}
          onChange={(e) => setOibPredmet(e.target.value)}
          required
        />
        <button className="req-button" type="submit">
          Pretraži
        </button>
      </form>
      <button className="back-button" onClick={handleBackButtonClick}>
        Nazad
      </button>
    </div>
  );
}

export default InfoForm;
