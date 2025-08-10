import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DoctorDashboard from './components/Doctor/dashboard';
import PatientDashboard from './components/Patient/dashboard';
import AdminDashboard from './components/Admin/Dashboard';

import ChatList from './components/Chat/ChatList';
import FindDoctor from './components/Patient/FindDoctor';
import './components/Chat/chatlist.css';

function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/patient/chats" element={<ChatList />} />
        <Route path="/patient/find-doctor" element={<FindDoctor />} />
      </Routes>

  );
}

export default App;