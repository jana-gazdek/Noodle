import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/pocetna/raspored.css";

const Raspored = () => {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [scheduleR, setScheduleR] = useState([]);
  const [razred, setRazred] = useState("");
  const [razrednik, setRazrednik] = useState("");
  const [scriptMessage, setScriptMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (user){
        fetchRazred(user.googleId, user.role);
        if (user.role === "profesor" || user.role === "satničar") {
          fetchRazrednik(user.googleId);
        }
      }
    }, [user]);

    useEffect(() => {
      if(user){
        if (user.role === "učenik"){
          fetchSchedule(razred);
        }
        else if (user.role !== "admin") {
          fetchScheduleProf(user.googleId);
        }
      }
      }, [razred]);
    
    useEffect(() => {
      if (razrednik !== "NONE"){
        fetchScheduleRazrednik(razrednik);
      }
    }, [razrednik]);

  const fetchRazred = async (googleId, role) => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazred", {googleId, role});
      setRazred(response.data.userRazred);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  const fetchRazrednik = async (googleId) => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazrednik", {googleId});
      setRazrednik(response.data.userRazrednik);
    } catch (error) {
      console.error("Error fetching razrednik:", error.message);
    }
  };

  const fetchSchedule = async (razred) => {
    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/schedule-data', {razred}, { withCredentials: true });
      setSchedule(response.data.original_tjedan);
    } catch (error) {
      console.error("Error fetching raspored:", error.message);
    }
  };

  const fetchScheduleProf = async (googleId) => {
    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/schedule-data-prof', {googleId}, { withCredentials: true });
      setSchedule(response.data.original_tjedan);
    } catch (error) {
      console.error("Error fetching raspored:", error.message);
    }
  };

  const fetchScheduleRazrednik = async (razred) => {
    try {
      const response = await axios.post('https://noodle-raspored.onrender.com/schedule-data', {razred}, { withCredentials: true });
      setScheduleR(response.data.original_tjedan);
    } catch (error) {
      console.error("Error fetching raspored:", error.message);
    }
  };

  const timeSlots = ["08:00:00", "08:50:00", "09:40:00", "10:30:00", "11:20:00", "12:10:00", "13:00:00"];
  const timeSlots2 = ["8:00", "8:50", "9:40", "10:40", "11:30", "12:20", "13:10"];

  return (
    <>
      <div className="schedule-container">
        {(user?.role === "učenik") ? (
          <h2 id="schedule-title">Raspored za {razred} razred</h2>
          ) : (
          <h2 id="schedule-title">Vaš raspored</h2>
        )}
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
        {((user?.role === "profesor" || user?.role === "satničar") && razrednik !== "NONE") ?
          (<div className="schedule-container">
            <h2 id="schedule-title">Raspored za {razrednik} razred</h2>
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
                    {scheduleR.map((dan, colIndex) => {
                      const satAtTime = dan.find(sat => sat.vrijeme === time);
                      const vjezba = satAtTime && satAtTime.labos === "da" ? " (Vježbe)" : "";
                      return <td key={colIndex}>{satAtTime ? satAtTime.text + vjezba : ""}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>) :
          (<p></p>)
        }
      </>
    </>
  );
};

export default Raspored;
