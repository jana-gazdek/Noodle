import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/profiles.css";

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState({
    name: "",
    surname: "",
    email: "",
    OIB: "",
    dateOfBirth: "",
    address: "",
    primarySchool: "",
    role: "student",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post("http://localhost:3000/info/get-user-info", { OIB: id })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        setError("Korisnik nije pronađen.");
      });
  }, [id]);

  const handleBackButtonClick = () => {
    navigate("/auth/pocetna");
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/info/update-user-info", user)
      .then(() => {
        alert("Profil uspješno uređen.");
      })
      .catch(() => {
        alert("Greška pri uređivanju profila.");
      });
  };

  function getDate(dateObject) {
    const formattedDate = dayjs(dateObject).format("YYYY-MM-DD");

    return formattedDate;
  }

  if (error)
    return (
      <div>
        <h2>{error}</h2>
        <button className="back-button" onClick={handleBackButtonClick}>
          Nazad
        </button>
      </div>
    );

  return (
    <div className="form">
      <h1>Profil sa OIB-om: {id}</h1>
      <form className="infoform_profile" onSubmit={handleUpdate}>
        <p>
          <strong>Ime:</strong>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </p>
        <p>
          <strong>Prezime:</strong>
          <input
            type="text"
            value={user.surname}
            onChange={(e) => setUser({ ...user, surname: e.target.value })}
          />
        </p>
        <p>
          <strong>Email:</strong>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </p>
        <p>
          <strong>OIB:</strong>
          <input
            type="text"
            value={user.OIB}
            onChange={(e) => setUser({ ...user, OIB: e.target.value })}
          />
        </p>
        <p>
          <strong>Datum rođenja:</strong>
          <input
            type="date"
            value={getDate(user.dateOfBirth)}
            placeholder={getDate(user.dateOfBirth)}
            onChange={(e) => setUser({ ...user, dateOfBirth: e.target.value })}
          />
        </p>
        <p>
          <strong>Adresa:</strong>
          <input
            type="text"
            value={user.address}
            onChange={(e) => setUser({ ...user, address: e.target.value })}
          />
        </p>
        <p>
          <strong>Osnovna škola:</strong>
          <input
            type="text"
            value={user.primarySchool}
            onChange={(e) =>
              setUser({ ...user, primarySchool: e.target.value })
            }
          />
        </p>
        <p>
          <strong>Uloga:</strong>
          <select
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
          >
            <option value="student">Učenik</option>
            <option value="admin">Profesor</option>
            <option value="admin">Satničar</option>
            <option value="denied">Odbijen</option>
          </select>
        </p>
        <div className="buttons">
          <button type="submit">Spremi</button>
          <button className="back-button" onClick={handleBackButtonClick}>
            Nazad
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
