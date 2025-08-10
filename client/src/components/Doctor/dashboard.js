import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import { parseJwt } from '../../utils/jwt';
import Chat from '../Chat/Chat';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = useMemo(() => parseJwt(token)?.id, [token]);

  // Example usage: pass userId to Chat component (replace chatId/otherUserName as needed)
  // <Chat chatId={someChatId} userId={userId} otherUserName={"Patient Name"} />

  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-dashboard-title">MediConnect</div>
      <div className="doctor-dashboard-boxes">
        <button className="doctor-dashboard-box" onClick={() => navigate('/doctor/chats')}>Chats</button>
        <button className="doctor-dashboard-box" onClick={() => navigate('/doctor/appointments')}>Appointments</button>
      </div>
      <div className="doctor-dashboard-boxes">
        <button className="doctor-dashboard-box" onClick={() => navigate('/doctor/profile')}>My Profile</button>
      </div>
      {/* Example Chat usage: <Chat chatId={...} userId={userId} otherUserName={...} /> */}
      <button className="doctor-dashboard-logout" onClick={() => {
        localStorage.removeItem('token');
        navigate('/login');
      }}>
        Logout
      </button>
    </div>
  );
};


export default DoctorDashboard;