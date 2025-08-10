import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import '../Auth/register.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="patient-dashboard-container">
      <div className="logo-icon"><img src="/logo_medi.png" /><img className="logo" src="/medi_icon2.png"/></div>
      <div className="patient-dashboard-boxes">
        <button className="patient-dashboard-box" onClick={() => navigate('/patient/chats')}>My Chats</button>
        <button className="patient-dashboard-box" onClick={() => navigate('/patient/find-doctor')}>Find a doctor</button>
      </div>
      <div className="patient-dashboard-boxes">
        <button className="patient-dashboard-box" onClick={() => navigate('/patient/diagnosis')}>Diagnosis with ML</button>
        <button className="patient-dashboard-box" onClick={() => navigate('/patient/profile')}>My Profile</button>
      </div>
      <button className="patient-dashboard-logout" onClick={() => {
        localStorage.removeItem('token');
        navigate('/');
      }}>
        Logout
      </button>
    </div>
  );
};


export default PatientDashboard;
