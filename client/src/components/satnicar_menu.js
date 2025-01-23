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

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const fetchRazred = async () => {
    try {
      const response = await axios.get("http://localhost:3000/info/getRazredSatnicarMenu");
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
      const response = await axios.post('http://localhost:3006/schedule-data', {razred}, { withCredentials: true });
      setSchedule(response.data.original_tjedan);
    } catch (error) {
      console.error("Error fetching raspored:", error.message);
    }
  };

  const fetchRasporedProfesor = async (id) => {
    try {
      const response = await axios.post('http://localhost:3006/schedule-data-prof-oib', {OIB : id}, { withCredentials: true });
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
  
  if(user)
    return (
      <div className = "satnicar-menu">
        <div className = "satnicar-header">
          <Header
              user={user}
              handleLogout={() => {
              window.location.href = "http://localhost:3000/auth/logout";
            }}
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
              <button className="req-button" onClick={handleSubmit}>
                Pretraži
              </button>
            )}
          </div>
          <div className ="satnicar-raspored">
            {(schedule !== "ne") && (
              <Rasporedsatnicar
                schedule = {schedule}
              />
            )}
          </div>
        </div>
      </div>
    );
};

export default Satnicarmenu;
