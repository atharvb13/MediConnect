// frontend/src/components/Auth/Register.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import './register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  // Fetch city/state from zip code
  const handleZipBlur = async () => {
    if (!zip) return;
    setCity('');
    setState('');
    setError('');
    try {
      const res = await axios.get(`http://api.zippopotam.us/us/${zip}`);
      if (res.data && res.data.places && res.data.places.length > 0) {
        setCity(res.data.places[0]['place name']);
        setState(res.data.places[0]['state']);
        setCountry('United States');
      } else {
        setError('Invalid ZIP code');
      }
    } catch (err) {
      setError('Invalid ZIP code');
    }
  };
  const [password, setPassword] = useState('');
  const [qualification, setQualification] = useState('');
  const [medicalLicenseId, setMedicalLicenseId] = useState('');
  const [profession, setProfession] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [doctorStep, setDoctorStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];


  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`http://localhost:5001/api/auth/send-otp`, { email });
      if (res.data.success) {
        setOtpSent(true);
        setMessage('OTP sent to your email');
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Error sending OTP'
      );
    }
    setLoading(false);
  };

  // const handleVerifyOtp = async () => {
  //   setOtpVerified(true);
  // }
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`http://localhost:5001/api/auth/verify-otp`, {
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
    let valid = name && age && zip && city && state && country && password;
    if (userType === 'doctor') {
      valid = valid && qualification && medicalLicenseId && profession && clinicAddress;
    }
    if (!valid) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
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
        zip,
        role: userType
      };
      if (userType === 'doctor') {
        payload.qualification = qualification;
        payload.medicalLicenseId = medicalLicenseId;
        payload.profession = profession;
        payload.clinicAddress = clinicAddress;
      }
      const res = await axios.post(`http://localhost:5001/api/auth/register`, payload);
      if (res.status==200) {
        if(userType === 'patient') {
          alert('Registration successful!');
          navigate('/');
        }
        else
         setMessage('Registration successful! Awaiting admin approval.');
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Error during registration');
    }
    setLoading(false);
  };


  const handleGoogleRegister = () => {
    window.location.href = `http://localhost:5001/api/auth/google`;
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
          <div className="logo-icon"><img src="/logo_medi.png" /><img className="logo" src="/medi_icon2.png"/></div>
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
              
              {userType === 'doctor' && doctorStep === 2 ? (
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
                  <select
                    value={profession}
                    onChange={e => setProfession(e.target.value)}
                    disabled={loading}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdbdbd', marginBottom: 10 }}
                  >
                    <option value="">Select Profession</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pathologist">Pathologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Urologist">Urologist</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Clinic/Hospital Address"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    className="submit-btn"
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
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
                  <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
                    <input
                      type="text"
                      placeholder="Location ZIP Code"
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleZipBlur(); }}
                      disabled={loading}
                      maxLength={10}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="submit-btn"
                      style={{ width: 80, marginTop: 0,height: 45 }}
                      onClick={handleZipBlur}
                      disabled={loading || !zip}
                    >
                      Enter
                    </button>
                  </div>
                  {city && state && (
                    <>
                      <input
                        type="text"
                        placeholder="City"
                        value={city+', '+state}
                        disabled
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={country}
                        disabled
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
                  {userType === 'doctor' && doctorStep === 1 && (
                    <button
                      className="submit-btn"
                      style={{marginTop: 10}}
                      onClick={() => {
                        if (!name || !age || !zip || !city || !state || !country || !password) {
                          setError('Please fill all required fields');
                        } else {
                          setError('');
                          setDoctorStep(2);
                        }
                      }}
                      disabled={loading}
                    >
                      Next
                    </button>
                  )}
                  {userType !== 'doctor' && (
                    <button
                      className="submit-btn"
                      onClick={handleRegister}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  )}
                </>
              )}
            </>
          )
          }

          <p className="login-link">Already have an account? <a href="/">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
