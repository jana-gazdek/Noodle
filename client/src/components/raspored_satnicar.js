import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/pocetna/raspored.css";

function Rasporedsatnicar({ schedule = []}) {
  const [scriptMessage, setScriptMessage] = useState("");
  const [loading, setLoading] = useState(false)
  const timeSlots = ["08:00:00", "08:50:00", "09:40:00", "10:30:00", "11:20:00", "12:10:00", "13:00:00"];
  const timeSlots2 = ["8:00", "8:50", "9:40", "10:40", "11:30", "12:20", "13:10"];

  const runPythonScript = async () => {
    try {
      setLoading(true)
      const response = await axios.post("http://localhost:5000/run-script");
      setLoading(false)
      setScriptMessage(response.data.message);
    } catch (error) {
      setScriptMessage("Error running script.");
      setLoading(false)
    }
  };

  return (
    <>
      <div className="satnicar-schedule-container">
        <h2 id="satnicar-schedule-title">Odabran Raspored</h2>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Vrijeme</th>
              <th>Pon</th>
              <th>Uto</th>
              <th>Sri</th>
              <th>Čet</th>
              <th>Pet</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, rowIndex) => (
              <tr key={rowIndex}>
                <td>{timeSlots2[rowIndex]}</td>
                {schedule.map((dan, colIndex) => {
                  const satAtTime = dan.find(sat => sat.vrijeme === time);
                  const vjezba = satAtTime && satAtTime.labos === "da" ? " (Vježbe)" : "";
                  return <td key={colIndex}>{satAtTime ? satAtTime.text + vjezba : ""}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <div>
            <button onClick={runPythonScript}>
            Generiraj novi raspored
            </button>
            {scriptMessage && <p>{scriptMessage}</p>}
            {loading && <div className="spinner"></div>}{" "}
        </div>
        
      </div>
      </>
    </>
  );
};

export default Rasporedsatnicar;
