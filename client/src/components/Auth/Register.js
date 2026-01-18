// frontend/src/components/Auth/Register.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './register.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- Google detection ---------- */
  const params = new URLSearchParams(location.search);
  const isGoogleUser = params.get('google') === 'true';
  const googleData = isGoogleUser
    ? JSON.parse(decodeURIComponent(params.get('data')))
    : null;

  /* ---------- State ---------- */
  const [userType, setUserType] = useState('patient');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [password, setPassword] = useState('');

  // Doctor
  const [qualification, setQualification] = useState('');
  const [medicalLicenseId, setMedicalLicenseId] = useState('');
  const [profession, setProfession] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /* ---------- Prefill Google data ---------- */
  useEffect(() => {
    if (isGoogleUser && googleData) {
      setEmail(googleData.email);
      setName(googleData.name);
      setOtpVerified(true); // skip OTP
    }
  }, []);

  /* ---------- ZIP lookup ---------- */
  const handleZipBlur = async () => {
    if (!zip) return;
    try {
      const res = await axios.get(`http://api.zippopotam.us/us/${zip}`);
      if (res.data?.places?.length) {
        setCity(res.data.places[0]['place name']);
        setState(res.data.places[0]['state']);
      } else {
        setError('Invalid ZIP code');
      }
    } catch {
      setError('Invalid ZIP code');
    }
  };

  /* ---------- OTP ---------- */
  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5001/api/auth/send-otp', { email });
      setOtpSent(true);
      setMessage('OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5001/api/auth/verify-otp', {
        email,
        otp: enteredOtp
      });
      if (res.data.success) {
        setOtpVerified(true);
        setMessage('OTP verified');
      } else {
        setError('Invalid OTP');
      }
    } catch {
      setError('OTP verification failed');
    }
    setLoading(false);
  };

  const handleOtpInput = (e, i) => {
    const val = e.target.value;
    if (/^[0-9]?$/.test(val)) {
      const arr = enteredOtp.split('');
      arr[i] = val;
      setEnteredOtp(arr.join(''));
      if (val && i < 3) otpRefs[i + 1].current.focus();
      if (!val && i > 0) otpRefs[i - 1].current.focus();
    }
  };

  /* ---------- Register ---------- */
  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        email,
        age,
        zip,
        role: userType,
        location: { city, state, country }
      };

      if (isGoogleUser) {
        payload.googleId = googleData.googleId;
      } else {
        payload.password = password;
      }

      if (userType === 'doctor') {
        Object.assign(payload, {
          qualification,
          medicalLicenseId,
          profession,
          clinicAddress
        });
      }

      await axios.post('http://localhost:5001/api/auth/register', payload);
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  /* ---------- UI ---------- */
  return (
    <div className="register-container">
      <div className="register-left"></div>

      <div className="register-right">
        <div className="register-form">

          <div className="logo-icon">
            <img src="/logo_medi.png" />
            <img className="logo" src="/medi_icon2.png" />
          </div>

          <div className="user-type-toggle">
            <button
              className={`toggle-btn ${userType === 'patient' ? 'active' : ''}`}
              onClick={() => setUserType('patient')}
            >
              Patient
            </button>
            <button
              className={`toggle-btn ${userType === 'doctor' ? 'active' : ''}`}
              onClick={() => setUserType('doctor')}
            >
              Doctor
            </button>
          </div>

          <h2>Create Account</h2>

          {message && <div style={{ color: '#2e7d32', marginBottom: 10 }}>{message}</div>}
          {error && <div style={{ color: '#d32f2f', marginBottom: 10 }}>{error}</div>}

          {/* Email + OTP (email users only) */}
          {!isGoogleUser && !otpSent && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="submit-btn" onClick={handleSendOtp}>
                Send OTP
              </button>

              <div className="divider">
                <hr /><span>OR</span><hr />
              </div>

              <button
                className="google-btn"
                onClick={() => window.location.href = 'http://localhost:5001/api/auth/google'}
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  className="google-icon"
                />
                Sign In with Google
              </button>
            </>
          )}

          {!isGoogleUser && otpSent && !otpVerified && (
            <>
              <div className="otp-boxes">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    className="otp-input"
                    maxLength="1"
                    value={enteredOtp[i] || ''}
                    onChange={e => handleOtpInput(e, i)}
                  />
                ))}
              </div>
              <button className="submit-btn" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </>
          )}

          {otpVerified && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={e => setAge(e.target.value)}
              />

              <input
                type="text"
                placeholder="ZIP Code"
                value={zip}
                onChange={e => setZip(e.target.value)}
                onBlur={handleZipBlur}
              />

              {city && <input value={`${city}, ${state}`} disabled />}

              {!isGoogleUser && (
                <input
                  type="password"
                  placeholder="Create Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              )}

              {userType === 'doctor' && (
                <>
                  <input
                    type="text"
                    placeholder="Medical Qualification"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Medical License ID"
                    value={medicalLicenseId}
                    onChange={e => setMedicalLicenseId(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Profession"
                    value={profession}
                    onChange={e => setProfession(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Clinic Address"
                    value={clinicAddress}
                    onChange={e => setClinicAddress(e.target.value)}
                  />
                </>
              )}

              <button className="submit-btn" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </>
          )}

          <p className="login-link">
            Already have an account? <a href="/">Login</a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
