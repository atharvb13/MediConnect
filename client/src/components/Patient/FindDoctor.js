

import React, { useState } from 'react';
import axios from 'axios';
import '../Auth/register.css';
import './findDoctor.css';

const FindDoctor = () => {
  const [zip, setZip] = useState(() => {
    // Try to get user zip from localStorage (assuming user object is stored after login)
    try {
      const user_zip = localStorage.getItem('zip');
      console.log('User from localStorage:', user_zip);
      return user_zip|| '';
    } catch {
      return '';
    }
  });
  const patientId = localStorage.getItem('userId');
  const [search, setSearch] = useState('');
  const [profession, setProfession] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/patient/findDoctors/${zip}`);
      setDoctors(res.data);
    } catch (err) {
      setError('Error fetching doctors');
    }
    setLoading(false);
  };

  // Filter doctors when profession or search changes
  React.useEffect(() => {
    let filtered = doctors;
    if (profession) filtered = filtered.filter(doc => doc.profession === profession);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name && doc.name.toLowerCase().includes(s)
      );
    }
    setFilteredDoctors(filtered);
  }, [doctors, profession, search]);

   
  const handleChat = async (doctorId) => {
    // Start chat API
    try {
      const res = await axios.post('http://localhost:5000/api/chat/start', {
        doctorId,
        patientId
      });
      if (res.data.chat && res.data.chat._id) {
        window.location.href = `/patient/chats?chatId=${res.data.chat._id}`;
      }
    } catch (err) {
      alert('Error starting chat');
    }
  };

  const handleBook = (doctorId) => {
    // Redirect to appointment booking page (to be implemented)
    window.location.href = `/patient/book-appointment?doctorId=${doctorId}`;
  };

    React.useEffect(() => {
    if (zip) {
      handleSearch();
    }
  }, []);

  return (
    <div className="find-doctor-container">
      <h2>Find a Doctor</h2>
      <div className="find-doctor-search-bar">
        <div className="zip-search-wrapper">
          <input
            type="text"
            placeholder="ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="zip-search-input"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="zip-search-btn"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <select
          value={profession}
          onChange={e => setProfession(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdbdbd' }}
        >
          <option value="">All Professions</option>
          <option value="General Physician">General Physician</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Dentist">Dentist</option>
          <option value="ENT Specialist">ENT Specialist</option>
          <option value="Gynecologist">Gynecologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Oncologist">Oncologist</option>
          <option value="Ophthalmologist">Ophthalmologist</option>
          <option value="Orthopedic">Orthopedic</option>
          <option value="Pathologist">Pathologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Psychiatrist">Psychiatrist</option>
          <option value="Pulmonologist">Pulmonologist</option>
          <option value="Radiologist">Radiologist</option>
          <option value="Urologist">Urologist</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="doctor-list">
        {filteredDoctors.map(doc => (
          <div className="doctor-card" key={doc._id}>
            <div className="doctor-card-header">
              <span className="doctor-name">{doc.name}</span>
              <span className="doctor-qualification">{doc.qualification}</span>
            </div>
            <div className="doctor-card-details">
              <div>Profession: {doc.profession}</div>
              <div>Location: {doc.location?.city}, {doc.location?.state}, {doc.location?.country}</div>
              <div>Email: {doc.email}</div>
            </div>
            <div className="doctor-card-actions">
              <button onClick={() => handleChat(doc._id)}>Chat</button>
              <button onClick={() => handleBook(doc._id)}>Book Appointment</button>
            </div>
          </div>
        ))}
        {doctors.length === 0 && !loading && <div>No doctors found.</div>}
      </div>
    </div>
  );
};

export default FindDoctor;
