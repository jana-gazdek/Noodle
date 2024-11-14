import React from 'react';
import '../styles/login.css';

function Login({ handleGoogleLogin }) {
  return (
    <div className="login-container">
      <div className="login-section">
        <h1>Prijavi se</h1>
        <form>
          <label>
            <input type="email" className="input-field" placeholder='e-mail'/>
          </label>
          <label>
            <input type="password" className="input-field" placeholder='zaporka'/>
          </label>
          <button type="submit" className="login-button">Prijava</button>
        </form>
        <div className="separator"></div>
        <button onClick={handleGoogleLogin} className="google-login-button">Continue with Google</button>
        <button className="microsoft-login-button">Sign in with Microsoft</button>
      </div>

      <div className="welcome-section">
        <h1>Dobrodošli u Noodle</h1>
        <p>Niste registrirani?</p>
        <button className="register-button">Registracija</button>
      </div>
    </div>
  );
}

export default Login;
