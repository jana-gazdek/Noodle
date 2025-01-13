import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/infoform.css";

function InfoForm({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    OIB: "",
    address: "",
    dateOfBirth: "",
    primarySchool: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dateTimeOfRequest = new Date(); //vrijeme slanja upita

    try {
      const response = await axios.post(
        "http://localhost:3000/info/submit-request",
        {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          OIB: formData.OIB,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          primarySchool: formData.primarySchool,
          googleId: user.googleId,
          dateTimeOfRequest,
        }
      );

      alert("Zahtjev uspješno poslan!");
      window.location.reload();
    } catch (error) {
      alert("Zahtjev nije poslan. Pokušajte ponovo.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const updatedFormData = {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      OIB: formData.OIB,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth,
      primarySchool: formData.primarySchool,
    };

    updatedFormData[name] = value;
    setFormData(updatedFormData);
  };

  return (
    <div className="form">
      <h1>Unesite podatke: </h1>
      <form className="infoform" onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ime"
          required
        />
        <input
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          placeholder="Prezime"
          required
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          name="OIB"
          value={formData.OIB}
          onChange={handleChange}
          placeholder="OIB"
          required
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Adresa"
          required
        />
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          placeholder="Datum rođenja"
          required
        />
        <input
          name="primarySchool"
          value={formData.primarySchool}
          onChange={handleChange}
          placeholder="Osnovna škola"
          required
        />
        <button className="Predaj_zahtjev">Predaj zahtjev</button>
      </form>
    </div>
  );
}

export default InfoForm;
