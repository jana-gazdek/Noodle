import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Pocetna({ handleLogout }) {
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate("/auth/pocetna");
  };

  return (
    <div className="nemoze">
      <h1>Odbijen pristup!</h1>
      <button className="back-button" onClick={handleBackButtonClick}>
        Nazad
      </button>
    </div>
  );
}
export default Pocetna;
