import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Common/ToastContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/Dashboard';
import DoctorAvailability from './components/Doctor/DoctorAvailability';
import DoctorProfile from './components/Doctor/doctorProfile';
import ChatList from './components/Chat/ChatList';
import FindDoctor from './components/Patient/FindDoctor';
import ClinicalCopilot from './components/Patient/ClinicalCopilot/ClinicalCopilot';
import AppointmentPage from './components/Patient/AppointmentPage';
import PatientProfile from './components/Patient/PatientProfile';
import OAuthSuccess from './components/Auth/oauth';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAvailability />
          </ProtectedRoute>
        } />
        <Route path="/doctor/profile" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorProfile />
          </ProtectedRoute>
        } />
        <Route path="/doctor/copilot" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ClinicalCopilot role="doctor" />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/chats" element={
          <ProtectedRoute allowedRoles={['doctor', 'patient']}>
            <ChatList />
          </ProtectedRoute>
        } />

        <Route path="/patient/diagnosis" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ClinicalCopilot role="patient" />
          </ProtectedRoute>
        } />
        <Route path="/patient/profile" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientProfile />
          </ProtectedRoute>
        } />
        <Route path="/patient/find-doctor" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <FindDoctor />
          </ProtectedRoute>
        } />
        <Route path="/patient/book-appointment" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <AppointmentPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
