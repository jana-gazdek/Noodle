import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/izostanci.css";
import dayjs from "dayjs";
import axios from 'axios';
import Header from "./header";

const IzostanciAdmin = () => {
  const [user, setUser] = useState(null);
  const [razredList, setRazredList] = useState([]);
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

  const fetchUčenici = async () => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazredUcenici", {razred : odabranRazred});
      setUčeniciList(response.data);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  useEffect(() => {
    if (user){
      fetchRazred(user.googleId, user.role);
    }
  }, [user]);

  const handleOdabir = async (id) => {
    try {
      const response = await axios.post('https://noodle-x652.onrender.com/info/ucenik-izostanci', {učenikID : id}, { withCredentials: true });
      setOdabranUčenikIzostanciList(response.data);
    } catch (error) {
      console.error("Error fetching učenik izostanci:", error.message);
    }
  };

  const handleDelete = async (a, b, event) => {
    event.preventDefault()
    const izostanak = { učenikID : odabranUčenikID, izostanakDatum : a, izostanakSat : b };

    try {
      const response = await axios.post('https://noodle-x652.onrender.com/info/brisanje-izostanka', izostanak, { withCredentials: true });
      const message = response.data.message;
      if (message === 'Izostanak uspješno obrisan.') {
        alert('Izostanak uspješno obrisan.');
        handleOdabir(odabranUčenikID);
      } else if (message === 'Izostanak ne postoji.') {
        alert('Izostanak ne postoji.');
      }
    } catch (error) {
      alert('Greška pri brisanju izostanka.');
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
      <form className="izostanci-infoform">
        <h2>Dodavanje/Uređivanje Izostanka</h2>
        <div>
            <div className = "odabir">
              <select
                  className="select-razred"
                  value={odabranRazred}
                  onChange={(e) => setOdabranRazred(e.target.value)}
              >
                  <option value="ne">Odaberi</option>
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
                    <p>{a.ime} {a.prezime}</p>
                    <p>Oib: {a.oib}</p>
                    <button type="button" onClick={() => handleClick(a.učenikid)}>Odaberi</button>
                  </div>
                  {a.učenikid === odabranUčenikID ? (
                    <>
                      {odabranUčenikIzostanciList.length != 0 ? (
                        <>
                          <h2>Izostanci: </h2>
                          {odabranUčenikIzostanciList.map((a) => (
                            <div key={a} className = "izostanci-opisi">
                              <p>{getDateEdit(a.izostanakDatum)}, {a.izostanakSat} sat: {a.izostanakStatus}</p>
                              <p>Opis: {a.izostanakOpis}</p>
                              <button type="button" className="req-button" onClick={(e) => handleDelete(getDateEdit(a.izostanakDatum), a.izostanakSat, e)}>Obriši izostanak</button>
                              <hr></hr>
                            </div>
                            ))}
                        </>  
                      ) : (
                        <p>Učenik nema izostanaka</p>
                      )}
                    </>
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

export default IzostanciAdmin;
