
import React, { useState } from 'react';
import axios from 'axios';
import './register.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/login`, { email, password });
      const { token, user, role } = res.data;
      localStorage.setItem('token', token);
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        if (user.role === 'admin') window.location.href = '/admin';
        else if (user.role === 'doctor') window.location.href = '/doctor';
        else window.location.href = '/dashboard';
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-left"></div>
      <div className="register-right">
        <div className="register-form">
          <div className="logo-icon">🔑</div>
          <h2>Login to Your Account</h2>
          {message && <div style={{ color: '#2e7d32', marginBottom: 10, fontWeight: 500 }}>{message}</div>}
          {error && <div style={{ color: '#d32f2f', marginBottom: 10, fontWeight: 500 }}>{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button className="submit-btn" onClick={handleLogin} disabled={loading || !email || !password}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="divider">
            <hr /><span>OR</span><hr />
          </div>
          <button
            className="google-btn"
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            disabled={loading}
          >
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="google-icon" /> Sign In with Google
          </button>
          <p className="login-link">Don't have an account? <a href="/register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;