import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import './findDoctor.css';

const FindDoctor = () => {
  const navigate = useNavigate();
  const patientId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole');

  const [zip, setZip] = useState(localStorage.getItem('zip') || '');
  const [search, setSearch] = useState('');
  const [profession, setProfession] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5001/api/patient/findDoctors/${zip}`);
      setDoctors(res.data);
    } catch (err) {
      setError('Error fetching doctors');
    }
    setLoading(false);
  };

  // Logic: Check for existing chat or send request
  const handleChat = async (doctorId) => {
    try {
      const res = await axios.post(`http://localhost:5001/api/chat/start`, {
        doctorId,
        patientId
      });

      const chat = res.data.chat;

      // 1. If chat already accepted, go to messages
      if (chat.status === 'accepted') {
        navigate('/patient/chats');
        return;
      }

      // 2. If chat is pending, notify user
      if (chat.status === 'pending') {
        alert("You already have a pending request with this doctor.");
        navigate('/patient/chats');
        return;
      }

      // 3. (Optional) Confirmation logic if startChat didn't auto-create
      const confirmSend = window.confirm("Would you like to send a chat request to this doctor?");
      if (confirmSend) {
        // Logic to update/re-send if necessary
        alert("Request sent successfully!");
        navigate('/patient/chats');
      }
    } catch (err) {
      alert("Error initiating chat.");
    }
  };

  return (
    <div className="layout-wrapper">
      <Sidebar role={role} />
      
      <div className="main-content">
        <div className="find-doctor-page">
          <header className="page-header">
            <h1 className="page-title">Find a Specialist</h1>
            <p className="page-subtitle">Connect with top-rated doctors in your area</p>
          </header>

          <section className="filter-section">
            <div className="zip-search-wrapper">
              <input
                className="zip-search-input"
                type="text"
                placeholder="Enter Zip Code"
                value={zip}
                onChange={e => setZip(e.target.value)}
              />
              <button className="zip-search-btn" onClick={handleSearch} disabled={loading}>
                {loading ? '...' : 'Search'}
              </button>
            </div>

            <div className="advanced-filters">
              <select value={profession} onChange={e => setProfession(e.target.value)}>
                <option value="">All Specializations</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
              </select>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </section>

          {error && <div className="error-banner">{error}</div>}

          <div className="doctor-grid">
            {doctors.filter(doc => 
              (profession === '' || doc.profession === profession) &&
              (search === '' || doc.name.toLowerCase().includes(search.toLowerCase()))
            ).map(doc => (
              <div className="modern-doctor-card" key={doc._id}>
                <div className="card-top">
                  <div className="doc-avatar">{doc.name.charAt(0)}</div>
                  <div className="doc-basic-info">
                    <h3>{doc.name}</h3>
                    <span className="badge">{doc.profession}</span>
                  </div>
                </div>
                
                <div className="card-body">
                  <p><strong>Qualification:</strong> {doc.qualification}</p>
                  <p><strong>Location:</strong> {doc.location?.city}, {doc.location?.state}</p>
                </div>

                <div className="card-footer">
                  <button className="btn-chat" onClick={() => handleChat(doc._id)}>Chat</button>
                  <button className="btn-book">Book Appointment</button>
                </div>
              </div>
            ))}
          </div>

          {!loading && doctors.length === 0 && (
            <div className="empty-state">Enter your zip code to find doctors nearby.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;