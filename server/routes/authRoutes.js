const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const axios = require('axios');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], 
                                                        accessType: 'offline', 
                                                        prompt:'consent' }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.login);

router.get('/logout', authController.logout);

router.get('/login', authController.verifyOrRefreshAccessToken, (req, res) => {
  if (req.user) {
    const user = req.user;
    res.status(200).json(user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

router.get('/pocetna', authController.verifyOrRefreshAccessToken, async (req, res) => {
  if (req.user) {
    const user = req.user;

    //prognoza
    const city = 'Zagreb';
    try {
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: 'metric'
        }
      });
      const weatherData = {
        temperature: Math.round(weatherResponse.data.main.temp),
        description: weatherResponse.data.weather[0].description,
        icon: weatherResponse.data.weather[0].icon,
        city: weatherResponse.data.name,
        country: weatherResponse.data.sys.country
      };

      console.log(user, weatherData)
      res.status(200).json({ user, weather: weatherData });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(200).json({user, weather: null});
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = router;
