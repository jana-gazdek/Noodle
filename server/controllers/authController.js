const axios = require('axios');

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, { sameSite: 'None', secure: true, maxAge: 3600 * 1000 }); // 1 hour
  res.cookie('refreshToken', refreshToken, { sameSite: 'None', secure: true, maxAge: 7 * 24 * 3600 * 1000 }); // 1 week
};

const login = (req, res) => {
  setCookies(res, req.user.accessToken, req.user.refreshToken);
  setTimeout(() => {
    res.redirect('https://noodle-frontend.onrender.com/pocetna');
  }, 500); // 500 ms delay
};
};

const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

const verifyOrRefreshAccessToken = async (req, res, next) => {
  let accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    if (!refreshToken) {
      return res.status(401).json({ error: 'Unauthorized na refreshu'});
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      accessToken = response.data.access_token;
      res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      req.user = response.data.user;
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized na requestu za access'});
    }
  }
  req.accessToken = accessToken;
  next();
};

module.exports = {
  login,
  logout,
  verifyOrRefreshAccessToken
};
