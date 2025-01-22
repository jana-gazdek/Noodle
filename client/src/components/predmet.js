import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/predmet.css";

function Predmet() {
  const { id } = useParams();
  const [djelatnik, setDjelatnik] = useState({
    djelatnikID: "",
    mobBroj: "",
    OIB: "",
    razred: "",
    razrednik: null,
  });

  const [predmeti, setPredmeti] = useState([]);
  const [sviPredmeti, setsviPredmeti] = useState([]);
  const [error, setError] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post("http://localhost:3000/info/pretrazi-predmete-profesora", { OIB: id }, { withCredentials: true })
      .then((response) => {
        setDjelatnik({
          djelatnikID: response?.data?.djelatnik?.djelatnikid || "",
          mobBroj: response?.data?.djelatnik?.mobbroj || "",
          OIB: response?.data?.djelatnik?.oib || "",
          razred: response?.data?.djelatnik?.razred || "",
          razrednik: response?.data?.djelatnik?.razrednik || null,
        });
        setPredmeti(response?.data?.predmeti || []);
      })
      .catch((error) => {
        setError("Korisnik nije pronađen.");
      });
  }, [id]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.post("http://localhost:3000/info/svi-predmeti");
        setsviPredmeti(response.data.predmeti || []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSubjects();
  }, []);

  const handleBackButtonClick = () => {
    navigate("/info/admin-menu");
  };

  const handleChange = (event) => {
    const { value, checked } = event.target;
    const predmetID = parseInt(value, 10);

    if (checked) {
      setPredmeti((prev) => [...prev, { predmetID }]);
    } else {
      setPredmeti((prev) => prev.filter((item) => item.predmetID !== predmetID));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const podatci = { djelatnikid: djelatnik.djelatnikID, predmeti };
    axios
      .post("http://localhost:3000/info/update-predmete-profesora", podatci, { withCredentials: true })
      .then(() => {
        alert("Predmet dodan.");
      })
      .catch(() => {
        alert("Greška pri uređivanju profila.");
      });
  };

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
    djelatnik.djelatnikID !== "" ? (
      <>
        <div className="form">
          <h1>Profesor sa OIB-om: {id}</h1>
          <h2>Odaberite predmete za profesora: </h2>
          <form className = "predmet-form" onSubmit={handleSubmit}>
          <ul>
            {sviPredmeti.map((subject) => (
              <li key={subject.predmetID}>
                <label>
                  <input
                    type="checkbox"
                    id={subject.predmetID}
                    value={subject.predmetID}
                    checked={predmeti.some((p) => p.predmetID === subject.predmetID)}
                    onChange={handleChange}
                  />
                  {subject.imePredmet}
                </label>
              </li>
            ))}
          </ul>
          <div className="buttons">
            <button className = "req-button" type="submit">Spremi</button>
            <button className="req-button" onClick={handleBackButtonClick}>
                  Nazad
            </button>
          </div>
        </form>
        </div>
      </>
    ) : null
  );
}

export default Predmet;
