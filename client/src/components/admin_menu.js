import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin_menu.css";

function InfoForm({ user }) {
    const [oib, setOib] = useState("");
    const navigate = useNavigate();

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

    const handleBackButtonClick = () => {
        navigate("/auth/pocetna");
      };

    return (
    <div className ="menu-container">
        <h1>Admin meni</h1>
      <button className="req-button" onClick={handleRequestButtonClick}>
            Zahtjevi
      </button>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className = "menu-input"
          placeholder="Upiši OIB za pretraživanje"
          value={oib}
          onChange={(e) => setOib(e.target.value)}
          required
        />
        <button className = "req-button" type="submit">Pretraži</button>
      </form>
      <button className="req-button" onClick={handleProstorijeButtonClick}>
            Prostorije
      </button>
      <button className="back-button" onClick={handleBackButtonClick}>
            Nazad
      </button>
    </div>
  );
}

export default InfoForm;
