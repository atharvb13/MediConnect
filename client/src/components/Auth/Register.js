// frontend/src/components/Auth/Register.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import './register.css';

const Register = () => {

  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [qualification, setQualification] = useState('');
  const [medicalLicenseId, setMedicalLicenseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];


  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/send-otp`, { email });
      if (res.data.success) {
        setOtpSent(true);
        setMessage('OTP sent to your email');
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP');
    }
    setLoading(false);
  };


  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/verify-otp`, {
        email,
        otp: enteredOtp
      });
      if (res.data.success) {
        setOtpVerified(true);
        setMessage('OTP verified!');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('OTP verification failed');
    }
    setLoading(false);
  };


  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        email,
        password,
        name,
        age,
        location: {
          city,
          state,
          country
        },
        role: userType
      };
      if (userType === 'doctor') {
        payload.qualification = qualification;
        payload.medicalLicenseId = medicalLicenseId;
      }
      const res = await axios.post(`http://localhost:5000/api/auth/register`, payload);
      if (res.data.success) {
        setMessage('Registration successful!');
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Error during registration');
    }
    setLoading(false);
  };


  const handleGoogleRegister = () => {
    window.location.href = `http://localhost:5000/api/auth/google`;
  };

  const handleOtpInput = (e, i) => {
    const val = e.target.value;
    if (/^[0-9]?$/.test(val)) {
      const newOtp = enteredOtp.split('');
      newOtp[i] = val;
      setEnteredOtp(newOtp.join(''));
      if (val && i < 3) {
        otpRefs[i + 1].current.focus();
      }
      if (!val && i > 0) {
        otpRefs[i - 1].current.focus();
      }
    }
  };


  return (
    <div className="register-container">
      <div className="register-left"></div>
      <div className="register-right">
        <div className="register-form">
          <div className="logo-icon">🔐</div>
          <div className="user-type-toggle">
            <button
              className={`toggle-btn ${userType === 'patient' ? 'active' : ''}`}
              onClick={() => setUserType('patient')}
              disabled={loading}
            >
              Patient
            </button>
            <button
              className={`toggle-btn ${userType === 'doctor' ? 'active' : ''}`}
              onClick={() => setUserType('doctor')}
              disabled={loading}
            >
              Doctor
            </button>
          </div>

          <h2>Create a {userType === 'doctor' ? 'Doctor' : 'Patient'} Account</h2>

          {message && <div style={{ color: '#2e7d32', marginBottom: 10, fontWeight: 500 }}>{message}</div>}
          {error && <div style={{ color: '#d32f2f', marginBottom: 10, fontWeight: 500 }}>{error}</div>}

          {!otpSent ? (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button className="submit-btn" onClick={handleSendOtp} disabled={loading || !email}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <div className="divider">
                <hr /><span>OR</span><hr />
              </div>
              <button className="google-btn" onClick={handleGoogleRegister} disabled={loading}>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="google-icon" /> Sign In with Google
              </button>
            </>
          ) : !otpVerified ? (
            <>
              <div className="otp-boxes">
                {[0, 1, 2, 3].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength="1"
                    className="otp-input"
                    value={enteredOtp[i] || ''}
                    ref={otpRefs[i]}
                    onChange={e => handleOtpInput(e, i)}
                    onFocus={e => e.target.select()}
                    disabled={loading}
                  />
                ))}
              </div>
              <button className="submit-btn" onClick={handleVerifyOtp} disabled={loading || enteredOtp.length !== 4}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
              />
              {userType === 'doctor' && (
                <>
                  <input
                    type="text"
                    placeholder="Medical Qualification (e.g., MD Pathology)"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Medical License ID"
                    value={medicalLicenseId}
                    onChange={(e) => setMedicalLicenseId(e.target.value)}
                    disabled={loading}
                  />
                </>
              )}
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button className="submit-btn" onClick={handleRegister} disabled={loading || !name || !password}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </>
          )}

          <p className="login-link">Already have an account? <a href="/">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
