import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
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

  const [predmeti, setPredmeti] = useState(null);
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
        setPredmeti(response?.data?.predmeti || [])
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
        console.log(sviPredmeti)
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSubjects();

  }, []);


  const handleBackButtonClick = () => {
    navigate("/info/admin-menu");
  };

  return (
    djelatnik.djelatnikID !== "" ? (
      <div className="form">
        <h1>Profesor sa OIB-om: {id}</h1>
        <h2>Odaberite predmete za profesora: </h2>
      </div>
    ) : null
  );    
}

export default Predmet;
