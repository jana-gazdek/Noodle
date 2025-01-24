import React, { useState, useEffect } from "react";
import "../styles/repository.css";
import "../styles/multiselect.css";
import axios from "axios";
import Header from "./header.js";

const Repository = () => {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razredList, setRazredList] = useState([]);
  const [selectedRazredList, setSelectedRazredList] = useState([]);
  const [expanded, setExpanded] = useState(false);

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
    fetchFiles(user.googleId, user.role);
    if (user.role !== "učenik") {
      fetchRazred(user.googleId, user.role);
    }
    }
  }, [user]);

  const fetchRazred = async (googleId, role) => {
    try {
      const response = await axios.post("https://noodle-x652.onrender.com/info/getRazred", {googleId, role});
      setRazredList(response.data.userRazred);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  const fetchFiles = async (googleId, role) => {
    try {
      const response = await axios.post("https://noodle-repo.onrender.com/files", { googleId, role });

      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    if (user) {
      formData.append("name", user.name);
      formData.append("surname", user.surname);
      formData.append("razredi", selectedRazredList);
    }
    setLoading(true);

    try {
      await axios.post("https://noodle-repo.onrender.com/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("File uploaded successfully!");
      fetchFiles(user.googleId, user.role);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`https://noodle-repo.onrender.com/download/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const mimeType = response.headers["content-type"];
      const extension = mimeType.split("/")[1];

      const fileName = `download.${extension}`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://noodle-repo.onrender.com/delete/${id}`);
      setMessage("File deleted successfully!");
      fetchFiles(user.googleId, user.role);
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file.");
    }
  };

  function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      setExpanded(true)
    } else {
      checkboxes.style.display = "none";
      setExpanded(false);
    }
  }

  const handleChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      setSelectedRazredList((prev) => [...prev, value ]);
    } else {
      setSelectedRazredList((prev) => prev.filter((item) => item !== value));
    }
  };

  return (
    <>
    {(user) && (
        <Header
        user={user}
        handleLogout={() => {
        window.location.href = "https://noodle-x652.onrender.com/auth/logout";
        }}
        selectedPage = "Repozitorij"
        />
      )}
    <div className="repozitori-form">
      <h1>Repozitorij</h1>

      {user && user.role !== "učenik" && user.role !== "admin"? (
        <>
          <div className="upload-section">
            <input className="choose-file-gumb" type="file" onChange={handleFileChange} />
            <div className="upload-gumb-i-spiner">
              <button
                className="upload-button"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
              {loading && <div className="spinner"></div>}{" "}
            </div>
          </div>
          <div className="odabir-razreda-container">
            <form>
              <div className="multiselect">
                <div className="selectBox" onClick={() => showCheckboxes()}>
                  <select>
                    <option>Odaberi razrede: </option>
                  </select>
                  <div className="overSelect">Odaberi razrede:<span>&#9660;</span></div>
                </div>
                <div id="checkboxes">
                  {razredList.map((razred) => (
                    <label key={razred} htmlFor={razred}>
                      <input 
                        type="checkbox" 
                        id={razred} 
                        value={razred}
                        onChange={handleChange}
                      /> {razred}
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </>  
      ) : (
        <div></div>
      )}

      <div className="files-list">
        <h2>Datoteke</h2>
        {files.length === 0 ? (
          <p>Trenutno nema datoteka.</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file.id}>
                <span className="span">{file.name}</span>
                <div className="btns">
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(file.id)}
                  >
                    Download
                  </button>
                  {user && user.role !== "učenik" ? (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(file.id)}
                    >
                      Delete
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </>
  );
};

export default Repository;
