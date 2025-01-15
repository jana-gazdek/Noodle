import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/profiles.css";

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState({
    OIB: "",
    name: "",
    surname: "",
    dateOfBirth: "",
    address: "",
    email: "",
    spol: "",
    učenikID: "",
    razred: "",
    škGod: "",
    smjer: "",
    djelatnikID: "",
    mobBroj: "",
    škGod: "",
    razrednik: null,
    id: "",
    role: ""
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post("https://noodle-x652.onrender.com/info/get-user-info", { OIB: id }, { withCredentials: true })
      .then((response) => {
        setUser({
          OIB: response?.data?.oib || "",
          name: response?.data?.ime || "",
          surname: response?.data?.prezime || "",
          dateOfBirth: response?.data?.datumrod || "",
          address: response?.data?.adresa || "",
          email: response?.data?.email || "",
          spol: response?.data?.spol || "",
          učenikID: response?.data?.učenikid || "",
          djelatnikID: response?.data?.djelatnikid || "",
          mobBroj: response?.data?.mobBroj || "",
          razred: response?.data?.razred || "",
          razrednik: response?.data?.razrednik || null,
          škGod: response?.data?.škgod || "",
          smjer: response?.data?.smjer || "",
          id: response?.data?._id || "",
          role: response?.data?.role || "",
        });
      })
      .catch((error) => {
        setError("Korisnik nije pronađen.");
      });
  }, [id]);

  const handleBackButtonClick = () => {
    navigate("/info/admin-menu");
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const podatci =
      user.role === "učenik"
        ? {_id : user.id, OIB: user.OIB, ime: user.name, prezime : user.surname, datumRod : user.dateOfBirth, adresa : user.address, email : user.email, spol : user.spol, role : user.role, učenikid : user.učenikID, razred : user.razred, škgod : user.škGod, smjer : user.smjer}
        : {_id : user.id, OIB: user.OIB, ime: user.name, prezime : user.surname, datumRod : user.dateOfBirth, adresa : user.address, email : user.email, spol : user.spol, role : user.role, djelatnikid : user.djelatnikID, mobbroj : user.mobBroj, razred : user.razred, razrednik : user.razrednik}
    axios
      .post("https://noodle-x652.onrender.com/info/update-user-info", podatci, { withCredentials: true })
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
      user.name !== "" ? (
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
              <strong>Spol:</strong>
              <select
                value={user.spol}
                placeholder={user.spol}
                onChange={(e) => setUser({ ...user, spol: e.target.value })}
              >
                <option value="M">Muško</option>
                <option value="F">Žensko</option>
              </select>
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
            { user.role !== "admin" ? (
              <p>
                <strong>Uloga:</strong>
                <select
                  value={user.role}
                  placeholder={user.role}
                  onChange={(e) => setUser({ ...user, role: e.target.value })}
                >
                  <option value="učenik">Učenik</option>
                  <option value="profesor">Profesor</option>
                  <option value="satničar">Satničar</option>
                  <option value="denied">Odbijen</option>
                </select>
              </p>
            ) : (
              <p></p>
            )
            } 
            {user.role === "učenik" ? (
              <>
                <p>
                  <strong>Razred:</strong>
                  <input
                    type = "text"
                    value={user.razred}
                    placeholder='oblik BrojVelikoSlovo; npr. "1B"'
                    onChange={(e) => setUser({ ...user, razred: e.target.value })}
                  />
                </p>
                <p>
                  <strong>Školska godina:</strong>
                  <input
                    type = "text"
                    value={user.škGod}
                    placeholder='godina./godina.; npr. 2024./2025.'
                    onChange={(e) => setUser({ ...user, škGod: e.target.value })}
                  />
                </p>
                <p>
                  <strong>Smjer:</strong>
                  <select
                    name="smjer"
                    value={user.smjer || ""}
                    onChange={(e) => setUser({ ...user, smjer: e.target.value })
                    }>
                      <option value="matematički">Matematički</option>
                      <option value="informatički">Informatički</option>
                  </select>{" "}
                </p>
            </>
            ) : (
              <>
                <p>
                  <strong>Broj mobitela:</strong>
                  <input
                    type = "text"
                    value={user.mobBroj}
                    onChange={(e) => setUser({ ...user, mobBroj: e.target.value })}
                  />
                </p>
                <p>
                  <strong>Razred/i:</strong>
                  <input
                    type = "text"
                    value={user.razred}
                    placeholder='oblik BrojVelikoSlovo,...; npr. "1B,2B"'
                    onChange={(e) => setUser({ ...user, razred: e.target.value })}
                  />
                </p>
                <p>
                  <label>
                    <input
                      type="checkbox"
                      checked={user.razrednik !== null}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setUser({ ...user, razrednik: null })
                        } else {
                          setUser({ ...user, razrednik: "" })
                        }
                      }}/>
                  </label>
                  <strong>Razrednik:</strong>
                    <input
                      name="razrednik"
                      value={user.razrednik || ""}
                      placeholder='oblik BrojVelikoSlovo; npr. "1B"'
                      onChange={(e) => setUser({ ...user, razrednik: e.target.value })}
                      disabled={user.razrednik === null}
                      className={user.razrednik === null ? "ugaseno" : ""}
                    />
                </p>
            </>
            )                
            }
            <div className="buttons">
              <button type="submit">Spremi</button>
              <button className="back-button" onClick={handleBackButtonClick}>
                Nazad
              </button>
            </div>
          </form>
        </div>
      ) : null
    );    
}

export default Profile;
