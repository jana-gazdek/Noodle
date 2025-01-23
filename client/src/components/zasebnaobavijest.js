import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/obavijesti.css";
import axios from "axios";

const Zasebnaobavijest = () => {
  const { linktekst } = useParams();
  const [obavijest, setObavijest] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchObavijest(linktekst);
  }, [linktekst]);
  
  const fetchObavijest = async (linkTekst) => {
    try {
      const response = await axios.post("http://localhost:3000/notification/zasebna-obavijest", {linkTekst : linkTekst}, { withCredentials: true });
      console.log(response)
      setObavijest(response.data.obavijest)
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching obavijest:", error.message);
    }
  };

  function getDatumVrijeme(datumobjave) {
    const datum = datumobjave.split("T");
    const god = (datum[0].split("-"))[0];
    const mje = (datum[0].split("-"))[1];
    const dan = (datum[0].split("-"))[2];
    const sat = (datum[1].split(":"))[0];
    const min = (datum[1].split(":"))[1];
    const sek = (((datum[1].split(":"))[2]).split("."))[0];
    return `${dan}.${mje}.${god}, ${sat}:${min}:${sek}`;
  }
  
  const handleBackButtonClick = () => {
    navigate("/auth/obavijesti");
  };
  
  if (isLoading) {
    return <p>Učitavanje...</p>;
  }

  return(
    <>
      <div className="zasebna-obavijest">
        <h1 className = "naslov-zasebne-obavijesti">{obavijest?.naslov}</h1>
        <p className = "tekst-zasebne-obavijesti">{obavijest?.tekst}</p>
        <h2 className = "podatci-zasebne-obavijesti">{`${obavijest?.autor}, ${getDatumVrijeme(obavijest?.datumobjave)} (${obavijest?.brojpregleda})`}</h2>
      </div>
      <button className="req-button" onClick={handleBackButtonClick}>
        Nazad
      </button>
    </>
  );
};

export default Zasebnaobavijest;