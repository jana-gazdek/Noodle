import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Pocetna from "./components/pocetna";
import Login from "./components/login";
import InfoForm from "./components/infoform";
import Requests from "./components/requests";
import Profile from "./components/profiles";
import Repository from "./components/repository";
import Unauthorized from "./components/unauthorized";
import axios from "axios";
import "./styles/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/pocetna", { withCredentials: true })
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
    window.location.href = "http://localhost:3000/auth/google";
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
      path: "/info/requests",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Requests />
        ) : (
          <Unauthorized />
        ),
    },
    {
      path: "info/profile/:id",
      element:
        isAuthenticated && user.role === "admin" ? (
          <Profile />
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
        isAuthenticated && user.role !== "unverified" ? (
          <Repository />
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
