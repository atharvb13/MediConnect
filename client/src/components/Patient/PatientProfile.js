import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Common/Sidebar';
import { FiCalendar, FiClock, FiUser, FiMapPin } from 'react-icons/fi'; // Suggested icons
import './profile.css';

const PatientProfile = () => {
  const role = localStorage.getItem('userRole');
  const patientId = localStorage.getItem('userId');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    location: { city: '', state: '' }, // Initializing nested object
    bloodGroup: '',
    dob: '',
    gender: 'Other'
  });

  const [appointments, setAppointments] = useState([]); // Real data state
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true); // Specific loader for appointments
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 🔹 Fetch Profile Data
  const getProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        'http://localhost:5001/api/patient/profile/me',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 API Call to Fetch Appointments
  const getAppointments = async () => {
    setAppLoading(true);
    try {
      // Adjusted to use the patientId from localStorage
      const res = await axios.get(`http://localhost:5001/api/appointments/patient/${patientId}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setAppLoading(false);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    try {
      setLoading(true);
      await axios.put(
        'http://localhost:5001/api/patient/profile/me',
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
    if (patientId) getAppointments();
  }, [patientId]);

  const handleChange = e => {
    const { name, value } = e.target;
    // Handling nested location object updates
    if (name === 'city' || name === 'state') {
      setProfile(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatDateForInput = date =>
    date ? new Date(date).toISOString().split('T')[0] : '';

  if (loading && !profile.name) {
    return <div className="profile-layout">Loading Profile...</div>;
  }

  return (
    <div className="profile-layout">
      <Sidebar role={role} />

      <div className="profile-main-content">
        {/* HEADER */}
        <div className="profile-header">
          <div className="user-banner">
            <div className="profile-avatar-large">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="user-meta">
              <h1>{profile.name || 'Patient'}</h1>
              <p>Member since {new Date().getFullYear()}</p>
            </div>
          </div>

          <button
            className={`edit-toggle-btn ${isEditing ? 'save' : ''}`}
            onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-grid">
          {/* PERSONAL INFO CARD */}
          <div className="profile-card">
            <h3 className="card-title">Personal Information</h3>
            <div className="info-fields">
              <div className="field-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>City</label>
                  <input
                    name="city"
                    value={profile.location?.city || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="field-group">
                  <label>State</label>
                  <input
                    name="state"
                    value={profile.location?.state || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Blood Group</label>
                  <input
                    name="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="field-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formatDateForInput(profile.dob)}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* REAL APPOINTMENTS CARD */}
          <div className="profile-card">
            <h3 className="card-title">Upcoming Appointments</h3>
            
            <div className="appointment-list-container">
  {appLoading ? (
    <div className="empty-state">
      <div className="loader-spinner"></div>
      <p>Fetching your appointments...</p>
    </div>
  ) : appointments.length === 0 ? (
    <div className="empty-state">
      <FiCalendar size={48} color="#cbd5e1" />
      <p>No upcoming appointments found.</p>
    </div>
  ) : (
    appointments.map(app => {
      const appDate = new Date(app.slot || app.date);
      return (
        <div key={app._id} className="appointment-item">
          {/* Date Side */}
          <div className="app-date-box">
            <span className="app-day">{appDate.getDate()}</span>
            <span className="app-month">
              {appDate.toLocaleString('default', { month: 'short' })}
            </span>
          </div>

          {/* Info Center */}
          <div className="app-details">
            <h4>Dr. {app.doctorName || 'Specialist'}</h4>
            <p>
              <FiMapPin size={14} /> 
              {app.doctorProfession || 'General Practitioner'}
            </p>
            <span className="app-time">
              <FiClock size={14} /> 
              {appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Status Right */}
          <div className="app-actions">
            <span className={`status-badge ${app.status?.toLowerCase() || 'pending'}`}>
              {app.status || 'Pending'}
            </span>
          </div>
        </div>
      );
    })
  )}
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;