const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
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

router.get('/pocetna', authController.verifyOrRefreshAccessToken, (req, res) => {
  if (req.user) {
    const user = req.user;
    res.status(200).json(user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = router;