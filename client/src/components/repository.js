import React, { useState, useEffect } from "react";
import "../styles/repository.css";
import "../styles/multiselect.css";
import axios from "axios";

const Repository = () => {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razredList, setRazredList] = useState([]);
  const [selectedRazredList, setSelectedRazredList] = useState([]);
  let expanded = false;

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

  useEffect(() => {
    if (user){
    fetchFiles(user.googleId, user.role);
    if (user.role === "profesor" || user.role === "satničar") {
      fetchRazred(user.googleId, user.role);
    }
    }
  }, [user]);

  const fetchRazred = async (googleId, role) => {
    try {
      const response = await axios.post("http://localhost:3003/getRazred", {googleId, role});
      setRazredList(response.data.userRazred);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  const fetchFiles = async (googleId, role) => {
    try {
      const response = await axios.post("http://localhost:3003/files", { googleId, role });

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
      await axios.post("http://localhost:3003/upload", formData, {
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
      const response = await axios.get(`http://localhost:3003/download/${id}`, {
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
      await axios.delete(`http://localhost:3003/delete/${id}`);
      setMessage("File deleted successfully!");
      fetchFiles(user.googleId, user.role);
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file.");
    }
  };

  function showCheckboxes(expanded) {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      expanded = true;
    } else {
      checkboxes.style.display = "none";
      expanded = false;
    }
    return expanded;
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
    <div className="form">
      <h1>Repozitorij</h1>

      {user && user.role !== "učenik" && user.role !== "admin"? (
        <>
          <div className="upload-section">
            <input type="file" onChange={handleFileChange} />
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
            {loading && <div className="spinner"></div>}{" "}
          </div>
          <div>
            <form>
              <div class="multiselect">
                <div className="selectBox" onClick={() => expanded = showCheckboxes(expanded)}>
                  <select>
                    <option>Odaberi razrede: </option>
                  </select>
                  <div class="overSelect"></div>
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
  );
};

export default Repository;
