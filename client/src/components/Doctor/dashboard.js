import React from 'react';
import '../../styles.css';

const DoctorDashboard = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>MediConnect</h1>
      <div className='boxes'>
        <button className='box'>Chats</button>
        <button className='box'>Appointments</button>
      </div>
      <div className='boxes'>
        <button className='box'>My Profile</button>
      </div>
      <button style={{marginTop: '60px' }}>Logout</button>
    </div>
  );
};


export default DoctorDashboard;