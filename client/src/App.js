import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/Dashboard';
import DoctorAvailability from './components/Doctor/DoctorAvailability';
import DoctorProfile from './components/Doctor/doctorProfile';

import ChatList from './components/Chat/ChatList';
import FindDoctor from './components/Patient/FindDoctor';
import ML_predict from './components/Patient/ML_predict';
import AppointmentPage from './components/Patient/AppointmentPage';
import PatientProfile from './components/Patient/PatientProfile';
import OAuthSuccess from './components/Auth/oauth';

function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/doctor/appointments" element={<DoctorAvailability />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/patient/diagnosis" element={<ML_predict />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/find-doctor" element={<FindDoctor />} />
        <Route path="/patient/book-appointment" element={<AppointmentPage />} />
      </Routes>

  );
}

export default App;