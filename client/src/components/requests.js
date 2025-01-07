import React, { useEffect, useState } from "react";
import axios from "axios";
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

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div>
        <button className="back-button" onClick={handleBackButtonClick}>
          Nazad
        </button>
      </div>
      <h1>Zahtjevi</h1>
      {requests.length > 0 ? (
        <ul>
          {requests.map((request) => (
            <li key={request._id}>
              {editingRequestId === request._id ? (
                <>
                  <strong>Ime:</strong>
                  <input
                    name="name"
                    value={updatedRequest.name}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>Prezime:</strong>
                  <input
                    name="surname"
                    value={updatedRequest.surname}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>Email:</strong>
                  <input
                    name="email"
                    value={updatedRequest.email}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>OIB:</strong>
                  <input
                    name="OIB"
                    value={updatedRequest.OIB}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>Adresa:</strong>
                  <input
                    name="address"
                    value={updatedRequest.address}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>Datum rođenja:</strong>
                  <input
                    name="dateOfBirth"
                    value={updatedRequest.dateOfBirth}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>Osnovna škola:</strong>
                  <input
                    name="primarySchool"
                    value={updatedRequest.primarySchool}
                    onChange={handleChange}
                  />{" "}
                  <br />
                  <strong>Uloga:</strong>
                  <select
                    name="role"
                    value={updatedRequest.role}
                    onChange={handleChange}
                  >
                    <option value="student">Učenik</option>
                    <option value="admin">Admin</option>
                    <option value="profesor">Profesor</option>
                  </select>{" "}
                  <br />
                  <button onClick={handleSave}>Spremi promjene</button>
                  <button onClick={() => setEditingRequestId(null)}>
                    Odustani
                  </button>
                </>
              ) : (
                <>
                  <strong>Name:</strong> {request.name} <br />
                  <strong>Surname:</strong> {request.surname} <br />
                  <strong>Email:</strong> {request.email} <br />
                  <strong>OIB:</strong> {request.OIB} <br />
                  <strong>Address:</strong> {request.address} <br />
                  <strong>Date of Birth:</strong> {request.dateOfBirth} <br />
                  <strong>Primary School:</strong> {request.primarySchool}{" "}
                  <br />
                  <strong>Status:</strong> {request.role} <br />
                  <button onClick={() => handleEdit(request)}>Uredi</button>
                  <button onClick={() => handleConfirm(request._id)}>
                    Prihvati
                  </button>
                  <button onClick={() => handleDeny(request._id)}>Odbij</button>
                  <hr />
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Trenutno nema zahtjeva.</p>
      )}
    </div>
  );
}

export default Requests;
