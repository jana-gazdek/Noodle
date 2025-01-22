import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../styles/prostorije.css";
import axios from 'axios';

const Prostorije = () => {
  const [kapacitet, setKapacitet] = useState('');
  const [oznaka, setOznaka] = useState('');
  const [tip, setTip] = useState('');
  const [deleteOznaka, setDeleteOznaka] = useState('');
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate("/info/admin-menu");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prostorija = { kapacitet, oznaka, tip };

    try {
      const response = await axios.post('https://noodle-x652.onrender.com/info/upis-prostorije', prostorija, { withCredentials: true });
      const message = response.data.message;
      if (message === 'Prostorija uspješno dodana.') {
        alert('Prostorija je uspješno dodana u bazu podataka.');
      } else if (message === 'Prostorija je uređena.') {
        alert('Prostorija je uspješno uređena.');
      }
    } catch (error) {
      alert('Greška pri upisu prostorije.');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const prostorija = { oznaka: deleteOznaka };

    try {
      const response = await axios.post('https://noodle-x652.onrender.com/info/brisanje-prostorije', prostorija, { withCredentials: true });
      const message = response.data.message;
      if (message === 'Prostorija uspješno obrisana.') {
        alert('Prostorija je uspješno obrisana iz baze podataka.');
      } else if (message === 'Prostorija s danom oznakom ne postoji.') {
        alert('Prostorija s navedenom oznakom ne postoji.');
      }
    } catch (error) {
      alert('Greška pri brisanju prostorije.');
    }
  };

  return (
    <div className="prostorije-container">
      <h1 className = "prostorije-naslov">Upravljanje Prostorijama</h1>
      <form className="infoform" onSubmit={handleSubmit}>
        <h2>Dodavanje/Uređivanje Prostorije</h2>
        <input
          type="number"
          placeholder="Kapacitet"
          value={kapacitet}
          onChange={(e) => setKapacitet(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Oznaka"
          value={oznaka}
          onChange={(e) => setOznaka(e.target.value)}
          required
        />
        <select
          name="tip"
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          required
        >
            <option value="">Odaberi tip</option>
            <option value="učionica">Učionica</option>
            <option value="dvorana">Dvorana</option>
        </select>
        <button className = "req-button" type="submit">Spremi</button>
      </form>

      <form className="infoform" onSubmit={handleDelete}>
        <h2>Brisanje Prostorije</h2>
        <input
          type="text"
          placeholder="Oznaka za brisanje"
          value={deleteOznaka}
          onChange={(e) => setDeleteOznaka(e.target.value)}
          required
        />
        <button className = "req-button" type="submit">Obriši</button>
      </form>
      <button className="prostorije-button" onClick={handleBackButtonClick}>
            Nazad
      </button>
    </div>
  );
};

export default Prostorije;
