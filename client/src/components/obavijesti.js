import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/obavijesti.css";
import axios from "axios";
import Header from "./header.js";

const Obavijesti = () => {
  const [user, setUser] = useState(null);
  const [razred, setRazred] = useState([]);
  const [selectedRazredList, setSelectedRazredList] = useState([]);
  const [naslov, setNaslov] = useState("");
  const [tekst, setTekst] = useState("");
  const [obavijestiList, setObavijestiList] = useState([]);
  const [obavijestiListAdmin, setObavijestiListAdmin] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => {
        setIsLoading(false); 
      });
  }, []);

  useEffect(() => {
    if (user){
        fetchRazred(user.googleId, user.role);
        if (user.role === "admin") {
            fetchObavijestiAdmin();
        }
    }
    }, [user]);

    useEffect(() => {
        if (razred.length > 0 && user?.role !== "admin") {
            fetchObavijesti();
        }
    }, [razred]);
  
  const fetchRazred = async (googleId, role) => {
    try {
      const response = await axios.post("http://localhost:3000/info/getRazred", {googleId, role});
      setRazred(response.data.userRazred);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };
  
  const fetchObavijesti = async () => {
    try {
      const razredi = Array.isArray(razred) ? razred.join(',') : razred;
      const response = await axios.post("http://localhost:3000/notification/ispis-obavijesti-razred", {razredi}, { withCredentials: true });
      setObavijestiList(response.data.obavijesti);
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  const fetchObavijestiAdmin = async () => {
    try {
      const response = await axios.get("http://localhost:3000/notification/ispis-obavijesti");
      setObavijestiListAdmin(response.data.obavijesti);
      console.log(obavijestiListAdmin)
    } catch (error) {
      console.error("Error fetching razred:", error.message);
    }
  };

  function genLink(naslov, datumObjave) {
    const inicijali = naslov.split(" ").map(word => word.charAt(0).toUpperCase()).join("");
    const datum = datumObjave.split(" ");
    const god = (datum[0].split("-"))[0].slice(-2);
    const mje = (datum[0].split("-"))[1];
    const dan = (datum[0].split("-"))[2];
    const sat = (datum[1].split(":"))[0];
    const min = (datum[1].split(":"))[1];
    const sek = (datum[1].split(":"))[2];
    return inicijali + dan + mje + god + sat + min + sek;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const datumObjave = new Date().toISOString().replace("T", " ").split(".")[0];
    const linkTekst = genLink(naslov, datumObjave);
    const autor = user.name + " " + user.surname;
    const razredString = selectedRazredList.join(",");
  
    const obavijest = {
      tekst: tekst,
      naslov: naslov,
      linkTekst: linkTekst,
      autor: autor,
      razred: razredString,
      datumObjave: datumObjave,
    };
  
    try {
      const response = await axios.post("http://localhost:3000/notification/slanje-obavijesti", obavijest, { withCredentials: true });
      const message = response.data.message;
  
      if (message === "Obavijest successfully sent") {
        alert("Obavijest uspješno poslana.");
  
        if (user.role === "admin") {
          fetchObavijestiAdmin();
        } else {
          fetchObavijesti();
        }
  
        setNaslov("");
        setTekst("");
      }
    } catch (error) {
      alert("Greška pri upisu obavijesti.");
    }
  };

  function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      setExpanded(true);
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

  const handleDelete = async (linkTekst, event) => {
    event.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/notification/brisanje-obavijesti', {linkTekst: linkTekst}, { withCredentials: true });
      const message = response.data.message;
      const error2 = response.data.error;
      if (message === 'Obavijest i povezan link uspješno obrisani') {
        fetchObavijestiAdmin();
        alert('Obavijest uspješno obrisana.');
      } else if (error2 === 'Obavijest nije pronađena') {
        alert('Obavijest ne postoji.');
      }
    } catch (error) {
      alert('Greška pri brisanju izostanka.');
    }
  };

  const handleZasebno = (linktekst) => {
    if (!linktekst) return;

    navigate(`/auth/obavijesti/${linktekst}`);
  };

  if (isLoading) {
    return <p>Učitavanje...</p>;
  }

  return (
    <div className="obavijesti-infoform">
      <div className = "obavijesti-header">
        {(user) && (
          <Header
          user={user}
          handleLogout={() => {
          window.location.href = "http://localhost:3000/auth/logout";
          }}
          selectedPage = "Obavijesti"
          />
        )}
      </div>
      <div className = "slanje">
        {(user?.role !== "učenik" && user?.role !== "admin") ? (
            <>
                <h1 className = "izostanak-naslov">Slanje obavijesti</h1>
                <form className="infoform" onSubmit={handleSubmit}>
                    <input
                        name="naslov"
                        value={naslov || ""}
                        placeholder="Unesite naslov obavijesti"
                        onChange={(e) =>
                        setNaslov(e.target.value)
                        }
                    />
                    <input
                        name="tekst"
                        value={tekst || ""}
                        placeholder="Unesite tekst obavijesti"
                        onChange={(e) =>
                        setTekst(e.target.value)
                        }
                    />
                    <div className="multiselect">
                        <div className="selectBox" onClick={() => showCheckboxes()}>
                        <select>
                            <option>Odaberi razrede: </option>
                        </select>
                        <div className="overSelect"></div>
                        </div>
                        <div id="checkboxes">
                        {razred.map((raz) => (
                            <label key={raz} htmlFor={raz}>
                            <input 
                                type="checkbox" 
                                id={raz} 
                                value={raz}
                                onChange={handleChange}
                            /> {raz}
                            </label>
                        ))}
                        </div>
                    </div>
                    <button type = "submit" className="req-button" onClick={handleSubmit}>
                      Pošalji obavijesti
                    </button>

                </form>
            </>
            ) : (
            <>
            </>    
        )}
      </div>
      <div className = "obavijesti">
        <h1>OBAVIJESTI</h1>
        {(user?.role === "admin") ? (
            <>
                {obavijestiListAdmin.map((a) => (
                    <div key={a.linktekst} className = "izostanci-li">
                        <p>{`${a.naslov}, ${a.autor} (${a.brojpregleda}, ${a.razred}):`}</p>
                        <p className = "porukica">{a.tekst}</p>
                        <button onClick={() => handleZasebno(a.linktekst)} className="btn">
                            Prikaži obavijest
                        </button>  
                        <button type="button" className="req-button" onClick={(e) => handleDelete(a.linktekst, e)}>Obriši obavijest</button>
                    </div>
                ))}
            </>
            ) : (
            <>
                {obavijestiList.map((a) => (
                    <div key={a.linktekst} className = "izostanci-li">
                        <>
                            {(user?.role !== "učenik") ? (
                                <p>{`${a.naslov}, ${a.autor} (${a.brojpregleda}, ${a.razred}):`}</p>
                            ) : (
                                <p>{`${a.naslov}, ${a.autor} (${a.brojpregleda}):`}</p>
                            )}
                        </>
                        <p className = "porukica">{a.tekst}</p> 
                        <button onClick={() => handleZasebno(a.linktekst)} className="btn">
                            Prikaži obavijest
                        </button> 
                    </div>
                ))}
            </>
        )}
            
            
        
      </div>
    </div>
  );
};

export default Obavijesti;
