const axios = require('axios');
const User = require('../models/User');

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 3600 * 1000 }); // 1 hour
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 7 * 24 * 3600 * 1000 }); // 1 week
};

const login = (req, res, accessToken, refreshToken) => {
  setCookies(res, accessToken, refreshToken);
  res.redirect('https://noodle-frontend.onrender.com/pocetna');
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out' });
      }
    })

  res.clearCookie('connect.sid', { httpOnly: true, secure: false });
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'None', secure: true });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
  res.redirect('https://noodle-frontend.onrender.com/login')
};

const verifyOrRefreshAccessToken = async (req, res, next) => {
  if (req.tokenVerified) return next();
  req.tokenVerified = true;

  let accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  //console.log(accessToken, refreshToken, req.user)

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ error: 'Unauthorized: Please log in again' });
  }

  try {
    if (accessToken) {
      const userResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      req.user = userResponse.data;
      return next();
    }

    if (refreshToken) {
      const response = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      });

      accessToken = response.data.access_token;
      setCookies(res, accessToken, refreshToken);

      const userId = req.user ? req.user.id : null;
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          accessToken: accessToken,
        });
      }

      const userResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      req.user = userResponse.data; 
      return next();
    }
  } catch (error) {
    console.error('Token handling error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Please log in again' });
  }
};


module.exports = {
  login,
  logout,
  verifyOrRefreshAccessToken,
};
