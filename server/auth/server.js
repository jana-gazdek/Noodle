const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const MongoStore = require('connect-mongo');
require('./config/passportConfig');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(cookieParser());

// COOKIE TEST

// app.use((req, res, next) => {
//   console.log('Cookies:', req.cookies);
//   console.log('Raw Cookie Header:', req.headers.cookie);
//   next();
// });

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie:{
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
