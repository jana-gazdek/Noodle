import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Pocetna from "./components/pocetna";
import Login from "./components/login";
import InfoForm from "./components/infoform";
import Adminmenu from "./components/admin_menu";
import Requests from "./components/requests";
import Profile from "./components/profiles";
import Repository from "./components/repository";
import Map from "./components/map.js";
import Prostorije from "./components/prostorije";
import Predmet from "./components/predmet";
import Izostanci from "./components/izostanci";
import IzostanciAdmin from "./components/izostanci_admin";
import Obavijesti from "./components/obavijesti";
import Zasebnaobavijest from "./components/zasebnaobavijest";
import Unauthorized from "./components/unauthorized";
import axios from "axios";
import "./styles/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("https://noodle-x652.onrender.com/auth/pocetna", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "https://noodle-x652.onrender.com/auth/google";
  };

  if (isAuthenticated === null) {
    return null;
  }

  const router = createBrowserRouter([
    {
      path: "/login",
      element: isAuthenticated ? (
        <Navigate to="/info/form" />
      ) : (
        <Login handleGoogleLogin={handleGoogleLogin} />
      ),
    },
    {
      path: "/info/form",
      element:
        isAuthenticated && user.role === "unverified" ? (
          <InfoForm user={user} />
        ) : (
          <Navigate to="/auth/pocetna" />
        ),
    },
    {
      path: "/info/admin-menu",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Adminmenu />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "/info/admin-menu/requests",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Requests />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "info/admin-menu/profile/:id",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Profile />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "info/admin-menu/prostorije",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Prostorije />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "info/admin-menu/predmet/:id",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Predmet />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "/auth/pocetna",
      element:
        isAuthenticated && user.role !== "unverified" ? (
          <Pocetna />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "/auth/repository",
      element:
        isAuthenticated && user.role !== "unverified" && user.role !== "pending" ? (
          <Repository />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "/auth/map",
      element:
        isAuthenticated && user.role !== "unverified" && user.role !== "pending" ? (
          <Map />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "/auth/izostanci",
      element:
        isAuthenticated ? (
          user.role === "admin" ? (
            <IzostanciAdmin />
          ) : user.role !== "unverified" && user.role !== "pending" && user.role !== "učenik" ? (
            <Izostanci />
          ) : (
            <Unauthorized />
          )
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "/auth/obavijesti",
      element:
        isAuthenticated && user.role !== "unverified" && user.role !== "pending" ? (
          <Obavijesti />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "auth/obavijesti/:linktekst",
      element:
      isAuthenticated && user.role !== "unverified" && user.role !== "pending" ? (
          <Zasebnaobavijest />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "*",
      element: <Navigate to="/login" />,
    },
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
