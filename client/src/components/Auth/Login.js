import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../Common/ToastContext';
import './register.css';

const HOME_ROUTES = {
  admin: '/admin',
  doctor: '/doctor/profile',
  patient: '/patient/profile',
};

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('zip', user.zip || '');

      addToast('Welcome back! Redirecting...', 'success', 2000);

      setTimeout(() => {
        navigate(HOME_ROUTES[user.role] || '/chats');
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left" aria-hidden="true" />

      <div className="register-right">
        <form className="register-form" onSubmit={handleLogin} noValidate>
          <div className="logo-icon">
            <img src="/logo_medi.png" alt="MediConnect logo" />
            <img className="logo" src="/medi_icon2.png" alt="" />
          </div>

          <h2>Login to Your Account</h2>
          <p className="auth-subtitle">Access appointments, messages, and Clinical Copilot</p>

          {error && (
            <div className="app-alert app-alert-error auth-alert" role="alert">
              {error}
            </div>
          )}

          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
            autoComplete="email"
            required
          />

          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !email || !password}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="divider">
            <hr /><span>OR</span><hr />
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={() => { window.location.href = 'http://localhost:5001/api/auth/google'; }}
            disabled={loading}
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt=""
              className="google-icon"
            />
            Sign in with Google
          </button>

          <p className="login-link">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
