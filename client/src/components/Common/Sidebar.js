import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiUser, FiCalendar, FiMessageSquare, FiSearch,
  FiActivity, FiLogOut, FiX, FiClipboard, FiGrid,
} from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import './Sidebar.css';

const NAV = {
  doctor: [
    { path: '/doctor/profile', label: 'Profile', icon: FiUser },
    { path: '/doctor/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/doctor/copilot', label: 'Clinical Copilot', icon: FiActivity },
    { path: '/chats', label: 'Chats', icon: FiMessageSquare },
  ],
  patient: [
    { path: '/patient/profile', label: 'Profile', icon: FiUser },
    { path: '/patient/diagnosis', label: 'Clinical Copilot', icon: FiActivity },
    { path: '/patient/find-doctor', label: 'Find a Doctor', icon: FiSearch },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: FiClipboard },
    { path: '/chats', label: 'Messages', icon: FiMessageSquare },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', icon: FiGrid },
  ],
};

const Sidebar = ({ role, isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;
  const items = NAV[role] || [];

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    onClose?.();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="sidebar-logo-container horizontal-logos">
            <img src="/logo_medi.png" alt="MediConnect" className="main-logo" />
            <img src="/medi_icon2.png" alt="" className="sub-logo" />
          </div>
          {isOpen && (
            <button type="button" className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
              <FiX size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-user">
          <span className="sidebar-role-badge">{role || 'user'}</span>
          <span className="sidebar-user-label">Signed in</span>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li className="menu-section-label">Main Menu</li>
            {items.map(({ path, label, icon: Icon }) => (
              <li
                key={path}
                className={isActive(path) ? 'active' : ''}
                onClick={() => handleNav(path)}
                onKeyDown={(e) => e.key === 'Enter' && handleNav(path)}
                role="button"
                tabIndex={0}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                <Icon className="sidebar-icon-svg" aria-hidden="true" />
                <span className="menu-text">{label}</span>
              </li>
            ))}
          </ul>

          <ul className="sidebar-menu logout-section">
            <li
              className="logout-item"
              onClick={() => setShowLogoutConfirm(true)}
              onKeyDown={(e) => e.key === 'Enter' && setShowLogoutConfirm(true)}
              role="button"
              tabIndex={0}
            >
              <FiLogOut className="sidebar-icon-svg" aria-hidden="true" />
              <span className="menu-text">Logout</span>
            </li>
          </ul>
        </nav>
      </aside>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="You will need to sign in again to access your account."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Sidebar;
