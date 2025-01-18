require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const polyline = require("@mapbox/polyline");

const app = express();
const PORT = process.env.PORT;
const ORS_API_KEY = process.env.ORS_API_KEY;

app.use(cors());
app.use(express.json());

app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, "public")));

app.post("/route", async (req, res) => {
  const { startCity, endCity } = req.body;

  try {
    const getCoordinates = async (city) => {
      const response = await axios.get(
        `https://api.openrouteservice.org/geocode/search`,
        {
          params: {
            api_key: ORS_API_KEY,
            text: city,
          },
        }
      );
      return response.data.features[0].geometry.coordinates;
    };

    const startCoords = await getCoordinates(startCity);
    const endCoords = await getCoordinates(endCity);

    const routeResponse = await axios.post(
      `https://api.openrouteservice.org/v2/directions/driving-car`,
      {
        coordinates: [startCoords, endCoords],
        options: {
          avoid_features: [],
          weightings: {
            motorway: 1.0,
            primary: 0.6,
            secondary: 0.3
        }
      },
        preference: "shortest",
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const decodedGeometry = polyline.decode(
      routeResponse.data.routes[0].geometry
    );
    res.json({ decodedGeometry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
