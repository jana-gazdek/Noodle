import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/satnicar_menu.css";
import Header from "./header.js";
import Rasporedsatnicar from "./raspored_satnicar.js";

const Satnicarmenu = () => {
  const [user, setUser] = useState(null);
  const [tipR, setTipR] = useState("");
  const [oib, setOib] = useState("");
  const [razredList, setRazredList] = useState([]);
  const [odabranRazred, setOdabranRazred] = useState("ne");
  const [schedule, setSchedule] = useState("ne");
  const [odabranDan, setOdabranDan] = useState("");
  const [odabranSat, setOdabranSat] = useState("");
  const [slobodniProfesori, setSlobodniProfesori] = useState([]);
  const [odabranPredmet, setOdabranPredmet] = useState("");
  const [odabranLabos, setOdabranLabos] = useState("");
  

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

  const fetchRazred = async () => {
    try {
      const response = await axios.get("https://noodle-x652.onrender.com/info/getRazredSatnicarMenu");
      setRazredList(response.data.userRazred);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  useEffect(() => {
    if (user){
      fetchRazred();
    }
  }, [user]);

  const fetchRasporedUčenik = async (razred) => {
    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/schedule-data', {razred}, { withCredentials: true });
      setSchedule(response.data.original_tjedan);
    } catch (error) {
      console.error("Error fetching raspored:", error.message);
    }
  };

  const fetchRasporedProfesor = async (id) => {
    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/schedule-data-prof-oib', {OIB : id}, { withCredentials: true });
      console.log(response)
      setSchedule(response.data.original_tjedan);
    } catch (error) {
      console.error("Error fetching raspored:", error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (tipR === "učenik") {
        fetchRasporedUčenik(odabranRazred);
      }
      else if (tipR === "profesor") {
        fetchRasporedProfesor(oib);
      }
    } catch (error) {
      alert('Greška pri dobavljanju rasporeda.');
    }
  };

  const handleSlobodni = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/free-profs', {dan : odabranDan, vrijeme : odabranSat, razred : odabranRazred}, { withCredentials: true });
      setSlobodniProfesori(response.data);
      console.log(response)
    } catch (error) {
      alert('Greška pri dobavljanju slobodnih profesora.');
    }
  };

  const handlePromjena= async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/update-schedule-data', {dan : odabranDan, vrijeme : odabranSat, razred : odabranRazred, imePredmet : odabranPredmet, labos : odabranLabos}, { withCredentials: true });
      console.log(response)
    } catch (error) {
      alert('Greška pri dobavljanju slobodnih profesora.');
    }
  };
  
  if(user)
    return (
      <div className = "satnicar-menu">
        <div className = "satnicar-header">
          <Header
              user={user}
              handleLogout={() => {
              window.location.href = "https://noodle-x652.onrender.com/auth/logout";
            }}
            selectedPage = "Satničar"
          />
        </div>
        <div className = "satnicar-body">
          <div className = "satnicar-odabir">
            <select
              name="tip-rasporeda"
              value={tipR || ""}
              onChange={(e) =>
                setTipR(e.target.value)
              }>
              <option value="">Odaberi učenik/profesor</option>
              <option value="učenik">Učenik</option>
              <option value="profesor">Profesor</option>
            </select>{""}
            {(tipR === "učenik") && (
              <select
                name="razred"
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
            )}
            {(tipR === "profesor") && (
              <input
                type="text"
                placeholder="Upiši OIB profesora"
                value={oib}
                onChange={(e) => setOib(e.target.value)}
                required
              />
            )}
            {(tipR !== "") && (
              <button className="satnicar-gumb" onClick={handleSubmit}>
                Pretraži
              </button>
            )}
          </div>
          <div className ="satnicar-raspored">
            {(schedule !== "ne" && tipR !== "") && (
              <Rasporedsatnicar
                schedule = {schedule}
              />
            )}
          </div>
          <div className = "satnicar-opcije">
            {(schedule !== "ne" && tipR === "učenik") && (
              <>
                <h2>Promjena rasporeda:</h2>
                <div>
                  <div className = "satnicar-promjena-inputi">
                    <select
                      name="dan"
                      value={odabranDan || ""}
                      onChange={(e) =>
                        setOdabranDan(e.target.value)
                      }>
                      <option value="">Odaberi dan</option>
                      <option value="1">Ponedjeljak</option>
                      <option value="2">Utorak</option>
                      <option value="3">Srijeda</option>
                      <option value="4">Četvrtak</option>
                      <option value="5">Petak</option>
                    </select>{""}
                    <select
                      name="sat"
                      value={odabranSat || ""}
                      onChange={(e) =>
                        setOdabranSat(e.target.value)
                      }>
                      <option value="">Odaberi sat</option>
                      <option value="08:00:00">1. sat</option>
                      <option value="08:50:00">2. sat</option>
                      <option value="09:40:00">3. sat</option>
                      <option value="10:30:00">4. sat</option>
                      <option value="11:20:00">5. sat</option>
                      <option value="12:10:00">6. sat</option>
                      <option value="13:00:00">7. sat</option>
                    </select>{""}
                  </div>
                  <button type = "button" className="satnicar-gumb" onClick={handleSlobodni}>
                    Pretraži slobodne profesore
                  </button>
                  <select
                    name="profesor"
                    value={odabranPredmet}
                    onChange={(e) => setOdabranPredmet(e.target.value)}
                  >
                    <option value="">Odaberi slobodnog profesora</option>
                    {slobodniProfesori?.map((a) => (
                    <option key={a.djelatnikid} value={a.imepredmet}>
                        {a.profesor}
                    </option>
                    ))}
                  </select>
                  <select
                    name="labos"
                    value={odabranLabos || ""}
                    onChange={(e) =>
                      setOdabranLabos(e.target.value)
                    }>
                    <option value="">Labos?</option>
                    <option value="da">Da</option>
                    <option value="ne">Ne</option>
                  </select>{""}
                  <button type = "button" className="satnicar-gumb" onClick={handlePromjena}>
                    Promjeni
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
};

export default Satnicarmenu;
