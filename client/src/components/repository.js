import React, { useState, useEffect } from "react";
import "../styles/repository.css";
import axios from "axios";

const Repository = () => {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

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

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:3003/files");
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
    setLoading(true);

    try {
      await axios.post("http://localhost:3003/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("File uploaded successfully!");
      fetchFiles();
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
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file.");
    }
  };

  return (
    <div className="form">
      <h1>Repozitorij</h1>

      {user && user.role !== "učenik" ? (
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
