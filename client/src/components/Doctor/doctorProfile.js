import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Common/Sidebar';
import './doctorProfile.css';

const DoctorProfile = () => {
  const role = localStorage.getItem('userRole');
  const doctorId = localStorage.getItem('userId');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    location: { city: '', state: '' },
    qualification: '',
    medicalLicenseId: '',
    profession: '',
    clinicAddress: '',
    dob: '',
    gender: 'Other'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Profile Data
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
        'http://localhost:5001/api/doctor/profile/me',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    try {
      setLoading(true);
      await axios.put(
        'http://localhost:5001/api/doctor/profile/me',
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
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
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
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="user-meta">
              <h1>{profile.name || 'Doctor'}</h1>
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
            <h3 className="card-title">Professional Information</h3>
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
              <div className="field-group">
                <label>Email</label>
                <input
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
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
              <div className="field-group">
                <label>Qualification</label>
                <input
                  name="qualification"
                  value={profile.qualification}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="field-group">
                <label>Medical License ID</label>
                <input
                  name="medicalLicenseId"
                  value={profile.medicalLicenseId}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="field-group">
                <label>Profession</label>
                <input
                  name="profession"
                  value={profile.profession}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="field-group">
                <label>Clinic Address</label>
                <input
                  name="clinicAddress"
                  value={profile.clinicAddress}
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
              <div className="field-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          {/* No appointments section for doctor */}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;