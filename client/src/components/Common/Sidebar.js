import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation(); // To detect active tab

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // Helper function to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-container horizontal-logos">
          <img src="/logo_medi.png" alt="MediConnect" className="main-logo" />
          <img src="/medi_icon2.png" alt="Icon" className="sub-logo" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <div className="menu-section-label">Main Menu</div>
          
          {role === 'doctor' && (
            <>
              <li 
                className={isActive('/doctor/profile') ? 'active' : ''} 
                onClick={() => navigate('/doctor/profile')}
              >
                <span className="sidebar-icon">👨‍⚕️</span> 
                <span className="menu-text">Profile</span>
              </li>
              <li 
                className={isActive('/doctor/appointments') ? 'active' : ''} 
                onClick={() => navigate('/doctor/appointments')}
              >
                <span className="sidebar-icon">📅</span> 
                <span className="menu-text">Appointments</span>
              </li>
              <li 
                className={isActive('/chats') ? 'active' : ''} 
                onClick={() => navigate('/chats')}
              >
                <span className="sidebar-icon">💬</span> 
                <span className="menu-text">Chats</span>
              </li>
            </>
          )}

          {role === 'patient' && (
            <>
              <li 
                className={isActive('/patient/profile') ? 'active' : ''} 
                onClick={() => navigate('/patient/profile')}
              >
                <span className="sidebar-icon">👤</span> 
                <span className="menu-text">Profile</span>
              </li>
              <li 
                className={isActive('/patient/diagnosis') ? 'active' : ''} 
                onClick={() => navigate('/patient/diagnosis')}
              >
                <span className="sidebar-icon">🩺</span> 
                <span className="menu-text">ML Diagnosis</span>
              </li>
              <li 
                className={isActive('/patient/find-doctor') ? 'active' : ''} 
                onClick={() => navigate('/patient/find-doctor')}
              >
                <span className="sidebar-icon">🔍</span> 
                <span className="menu-text">Find a Doctor</span>
              </li>
              <li 
                className={isActive('/chats') ? 'active' : ''} 
                onClick={() => navigate('/chats')}
              >
                <span className="sidebar-icon">💬</span> 
                <span className="menu-text">Messages</span>
              </li>
            </>
          )}
        </ul>

        <ul className="sidebar-menu logout-section">
          <li className="logout-item" onClick={handleLogout}>
            <span className="sidebar-icon">📤</span> 
            <span className="menu-text">Logout</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;