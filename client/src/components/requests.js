import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import "../styles/requests.css";
import { useNavigate } from "react-router-dom";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [updatedRequest, setUpdatedRequest] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/info/get-requests")
      .then((response) => {
        setRequests(response.data);
      })
      .catch((error) => {
        console.error("Greska:", error);
        setError("Greska kod ucitavanja zahtjeva");
      });
  }, []);

  const handleBackButtonClick = () => {
    navigate("/auth/pocetna");
  };

  const handleEdit = (request) => {
    setEditingRequestId(request._id);
    setUpdatedRequest({ ...request });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post(
        "http://localhost:3000/info/change-info-request",
        updatedRequest
      );
      setRequests((prev) =>
        prev.map((req) => (req._id === editingRequestId ? updatedRequest : req))
      );
      setEditingRequestId(null);
      alert("Uspjesna promjena zahtjeva.");
    } catch (error) {
      console.error("Greska:", error);
      alert("Greska kod promjene zahtjeva.");
    }
  };

  function removeRequestById(requests, id) {
    return requests.filter((request) => request._id !== id);
  }

  const handleConfirm = async (id) => {
    try {
      await axios.post("http://localhost:3000/info/confirm-request", {
        _id: id,
      });
      setRequests(removeRequestById(requests, id));
      alert("Uspjesno prihvacen zahtjev.");
    } catch (error) {
      console.error("Greska:", error);
      alert("Greska pri prihvacanju.");
    }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post("http://localhost:3000/info/deny-request", { _id: id });
      setRequests(removeRequestById(requests, id));
      alert("Uspjesno odbijen zahtjev.");
    } catch (error) {
      console.error("Greska:", error);
      alert("Greska pri odbijanju.");
    }
  };

  function getDate(dateObject) {
    const formattedDate = dayjs(dateObject).format("DD.MM.YYYY");

    return formattedDate;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="list">
      <div className="heder">
        <h1>Zahtjevi</h1>
        <div>
          <button className="back-button" onClick={handleBackButtonClick}>
            Nazad
          </button>
        </div>
      </div>
      {requests.length > 0 ? (
        <ul className="requests">
          {requests.map((request) => (
            <li key={request._id}>
              {editingRequestId === request._id ? (
                <>
                  <div className="redak">
                    <strong>Ime:</strong>
                    <input
                      name="name"
                      value={updatedRequest.name}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>Prezime:</strong>
                    <input
                      name="surname"
                      value={updatedRequest.surname}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>Email:</strong>
                    <input
                      name="email"
                      value={updatedRequest.email}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>OIB:</strong>
                    <input
                      name="OIB"
                      value={updatedRequest.OIB}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>Adresa:</strong>
                    <input
                      name="address"
                      value={updatedRequest.address}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>Datum rođenja:</strong>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={getDate(request.dateOfBirth)}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>Osnovna škola:</strong>
                    <input
                      name="primarySchool"
                      value={updatedRequest.primarySchool}
                      onChange={handleChange}
                    />{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <strong>Uloga:</strong>
                    <select
                      name="role"
                      value={updatedRequest.role}
                      onChange={handleChange}
                    >
                      <option value="student">Učenik</option>
                      <option value="admin">Satničar</option>
                      <option value="profesor">Profesor</option>
                    </select>{" "}
                    <br />
                  </div>
                  <div className="redak">
                    <button className="req-button" onClick={handleSave}>
                      Spremi
                    </button>
                    <button
                      className="req-button"
                      onClick={() => setEditingRequestId(null)}
                    >
                      Odustani
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Ime:</strong> {request.name} <br />
                  <strong>Prezime:</strong> {request.surname} <br />
                  <strong>Email:</strong> {request.email} <br />
                  <strong>OIB:</strong> {request.OIB} <br />
                  <strong>Adresa:</strong> {request.address} <br />
                  <strong>Datum rođenja:</strong> {getDate(request.dateOfBirth)}{" "}
                  <br />
                  <strong>Osnovna škola:</strong> {request.primarySchool} <br />
                  <strong>Uloga:</strong> {request.role} <br />
                  <button
                    className="req-button"
                    onClick={() => handleEdit(request)}
                  >
                    Uredi
                  </button>
                  <button
                    className="req-button"
                    onClick={() => handleConfirm(request._id)}
                  >
                    Prihvati
                  </button>
                  <button
                    className="req-button"
                    onClick={() => handleDeny(request._id)}
                  >
                    Odbij
                  </button>
                  <hr />
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <h2>Trenutno nema zahtjeva.</h2>
      )}
    </div>
  );
}

export default Requests;
