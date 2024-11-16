const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
require('./config/passportConfig');

dotenv.config();

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'https://noodle-frontend.onrender.com', credentials: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  secure: true,
  cookie: {
    sameSite: 'None',
    secure: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.get('/set-test-cookie', (req, res) => {
    res.cookie('simpleCookie', 'This is a simple test cookie', { maxAge: 3600000 });
    res.send('Simple test cookie set!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
