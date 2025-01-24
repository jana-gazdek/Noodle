import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/izostanci.css";
import dayjs from "dayjs";
import axios from 'axios';
import Header from "./header";

const Izostanci = () => {
  const [user, setUser] = useState(null);
  const [razredList, setRazredList] = useState([]);
  const [razrednik, setRazrednik] = useState([]);
  const [učeniciList, setUčeniciList] = useState([]);
  const [odabranUčenikID, setOdabranUčenikID] = useState('');
  const [odabranUčenikIzostanciList, setOdabranUčenikIzostanciList] = useState([]);
  const [izostanakDatum, setIzostanakDatum] = useState('');
  const [izostanakSat, setIzostanakSat] = useState('');
  const [izostanakStatus, setIzostanakStatus] = useState('');
  const [izostanakOpis, setIzostanakOpis] = useState('');
  const [odabranRazred, setOdabranRazred] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://noodle-x652.onrender.com/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    if (odabranRazred) {
        fetchUčenici();
    }
  }, [odabranRazred]);

  const fetchRazred = async (googleId, role) => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazred", {googleId, role});
      setRazredList(response.data.userRazred);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  const fetchRazrednik = async (googleId) => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazrednik", {googleId});
      setRazrednik(response.data.userRazrednik);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };


  const fetchUčenici = async () => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazredUcenici", {razred : odabranRazred});
      setUčeniciList(response.data);
    } catch (error) {
      console.error("Error fetching razred učenici:", error.message);
    }
  };

  useEffect(() => {
    if (user){
      fetchRazred(user.googleId, user.role);
      fetchRazrednik(user.googleId);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleOdabir(odabranUčenikID)
    const izostanak = { učenikID : odabranUčenikID, izostanakDatum : izostanakDatum, izostanakSat, izostanakStatus, izostanakOpis };

    try {
      const response = await axios.post('https://noodle-x652.onrender.com/info/upis-izostanka', izostanak, { withCredentials: true });
      const message = response.data.message;
      if (message === 'Izostanak uspješno dodan.') {
        alert('Izostanak je uspješno dodan u bazu podataka.');
        handleOdabir(odabranUčenikID);
      } else if (message === 'Izostanak je uređen.') {
        alert('Izostanak je uspješno uređen.');
        handleOdabir(odabranUčenikID);
      }
    } catch (error) {
      alert('Greška pri upisu izostanka.');
    }
  };

  const handleAutoFill = (dan, sat, status, opis) => {
    const localDate = dayjs(dan).format("YYYY-MM-DD");
    setIzostanakDatum(localDate);
    setIzostanakSat(sat);
    setIzostanakStatus(status);
    setIzostanakOpis(opis);
  };

  const handleOdabir = async (id) => {
    try {
      const response = await axios.post('https://noodle-x652.onrender.com/info/ucenik-izostanci', {učenikID : id}, { withCredentials: true });
      setOdabranUčenikIzostanciList(response.data);
    } catch (error) {
      console.error("Error fetching učenik izostanci:", error.message);
    }
  };

  const handleClick = (id) => {
    setOdabranUčenikID(id);
    handleOdabir(id)
  };

  function getDateEdit(dateObject) {
      const formattedDate = dayjs(dateObject).format("YYYY-MM-DD");
  
      return formattedDate;
    }
  
  return (
    <div className="izostanak-container">
      {(user) && (
        <Header
        user={user}
        handleLogout={() => {
        window.location.href = "https://noodle-x652.onrender.com/auth/logout";
        }}
        selectedPage = "Izostanci"
        />
      )}
      <h1 className = "izostanak-naslov">Upravljanje Izostancima</h1>
      <form className="izostanci-infoform" onSubmit={handleSubmit}>
        <h2>Dodavanje/Uređivanje Izostanka</h2>
        <div>
            <div className = "odabir">
              <select
                  className="select-razred"
                  value={odabranRazred}
                  onChange={(e) => setOdabranRazred(e.target.value)}
              >
                   <option value=""><span>&#9660;</span> Odaberi razred</option>
                  {razredList?.map((a) => (
                  <option key={a} value={a}>
                      {a}
                  </option>
                  ))}
              </select>
            </div>
            <div className = "izostanci-lista">
              {učeniciList?.map((a) => (
                <div className="izostanci-li" key={a.učenikid} id = {a.učenikid}>
                  <div className = "izostanci-podatci">
                    <p>Ime i prezime:  {a.ime} {a.prezime}</p>
                    <p>Oib:  {a.oib}</p>
                    <button className="izostanci-button-odaberi" type="button" onClick={() => handleClick(a.učenikid)}>Odaberi</button>
                  </div>
                  {a.učenikid === odabranUčenikID ? (
                  <div className="izostanci-inputi">
                    <input
                          type = "date"
                          name="izostanakDatum"
                          value={getDateEdit(izostanakDatum)}
                          onChange={(e) =>
                          setIzostanakDatum(getDateEdit(e.target.value))
                      }
                    />
                    <input
                          name="izostanakSat"
                          value={izostanakSat || ""}
                          placeholder="Unesite sat u obliku brojsata.; npr 1."
                          onChange={(e) =>
                          setIzostanakSat(e.target.value)
                      }
                    />
                    <select
                          name="izostanakStatus"
                          value={izostanakStatus || ""}
                          onChange={(e) =>
                            setIzostanakStatus(e.target.value)
                          }>
                            <option value="">Odaberi status</option>
                            {razrednik === odabranRazred && <option value="Opravdan">Opravdan.</option>}
                            {razrednik === odabranRazred && <option value="Neopravdan">Neopravdan.</option>}
                            <option value="Na čekanju">Na čekanju.</option>
                    </select>{""}
                    <input
                          name="izostanakOpis"
                          value={izostanakOpis || ""}
                          placeholder="Unesite opis izostanka"
                          onChange={(e) =>
                          setIzostanakOpis(e.target.value)
                      }
                    />
                    <button type = "submit" className="req-button" onClick={handleSubmit}>
                      Unesi izostanak
                    </button>
                    {odabranUčenikIzostanciList.length != 0 ? (
                      <>
                        <h2>Izostanci: </h2>
                        {odabranUčenikIzostanciList.map((a) => (
                          <div key={a} className = "izostanci-opisi">
                            <p>{getDateEdit(a.izostanakDatum)}, {a.izostanakSat} sat: {a.izostanakStatus}</p>
                            <p>Opis: {a.izostanakOpis}</p>
                            <button type = "button" onClick={() => handleAutoFill(a.izostanakDatum, a.izostanakSat, a.izostanakStatus, a.izostanakOpis)}>Promjeni</button>
                            <hr></hr>
                          </div>
                          ))}
                      </>  
                    ) : (
                      <div></div>
                    )}
                  </div>
                  ) : (
                  <div></div>
                  )}
                </div>
              ))}
            </div>
        </div>
      </form>
    </div>
  );
};

export default Izostanci;
