import React from 'react';
import '../../styles.css';

const PatientDashboard = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>Mediconnect</h1>
      <div className='boxes'>
        <button className='box'>My Chats</button>
        <button className='box'>Find a doctor</button>
      </div>
      <div className='boxes'>
        <button className='box'>Diagnosis with ML</button>
        <button className='box'>My Profile</button>
      </div>
      <button style={{marginTop: '60px' }}>Logout</button>
    </div>
  );
};


export default PatientDashboard;
