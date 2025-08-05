import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DoctorDashboard from './components/Doctor/dashboard';
import PatientDashboard from './components/Patient/dashboard';
import AdminDashboard from './components/Admin/Dashboard';
// import AddDoctor from './components/Admin/AddDoctor';
// import DoctorList from './components/Admin/DoctorList';

function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
       <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

  );
}

export default App;