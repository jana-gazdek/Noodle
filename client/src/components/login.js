import React from 'react';

function Login({ handleGoogleLogin }) {
  return (
    <div className="home-container">
      <h1>Welcome to the App</h1>
      <button onClick={handleGoogleLogin} className="login-button">
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
