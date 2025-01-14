const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const infoRoutes = require('./routes/infoRoutes');
const izdavanjePotvrde = require('./routes/izdavanjePotvrde');
const MongoStore = require('connect-mongo');
require('./config/passportConfig');

dotenv.config({ path: './env' });

const app = express();
const port = 3000;

app.use(express.json());

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
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie:{
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: false,
    //sameSite: 'none'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

app.use('/info', infoRoutes);
app.use('/auth', authRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/potvrda', izdavanjePotvrde);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});