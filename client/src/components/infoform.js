import React, { useState } from "react";
import axios from "axios";
import "../styles/infoform.css";

function InfoForm({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    pass: user?.pass || "",
    OIB: "",
    spol: "",
    address: "",
    dateOfBirth: "",
    primarySchool: "",
  });

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
          pass: formData.pass,
          OIB: formData.OIB,
          spol: formData.spol,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          primarySchool: formData.primarySchool,
          googleId: user.googleId,
          dateTimeOfRequest,
        }, { withCredentials: true }
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
      pass: formData.pass,
      OIB: formData.OIB,
      spol: formData.spol,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth,
      primarySchool: formData.primarySchool,
    };

    updatedFormData[name] = value;
    setFormData(updatedFormData);
  };

  return (
    <div className="infoform-container">
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
          type="password"
          name="pass"
          value={formData.pass}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          name="OIB"
          value={formData.OIB}
          onChange={handleChange}
          placeholder="OIB"
          required
        />
        <select
          name="spol"
          value={formData.spol}
          onChange={handleChange}
          required
        >
            <option value="">Odaberi spol</option>
            <option value="M">Muško</option>
            <option value="F">Žensko</option>
        </select>
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
