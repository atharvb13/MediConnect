import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../Common/PageLayout';
import Alert from '../Common/Alert';
import EmptyState from '../Common/EmptyState';
import { useToast } from '../Common/ToastContext';
import './findDoctor.css';

const FindDoctor = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
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

  const handleBookAppointment = (doctor) => {
  navigate('/patient/book-appointment', { 
    state: { 
      doctorId: doctor._id, 
      doctorName: doctor.name 
    } 
  });
};

  // Logic: Check for existing chat or send request
  const handleChat = async (doctorId) => {
    try {
      const res = await axios.post(`http://localhost:5001/api/chat/start`, {
        doctorId,
        patientId
      });

      const { chat, alreadyExists } = res.data;

      // 1. If chat already accepted, go to messages
      if (chat.status === 'accepted') {
        navigate('/chats');
        return;
      }

      // 2. If chat is pending, notify user
      if (alreadyExists && chat.status === 'pending') {
        addToast('You already have a pending request with this doctor.', 'warning');
        return;
      }

      addToast('Chat request sent successfully!', 'success');
      navigate('/chats');
    } catch (err) {
      addToast('Error initiating chat.', 'error');
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    (profession === '' || doc.profession === profession) &&
    (search === '' || doc.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageLayout role={role}>
      <div className="page-content">
        <div className="find-doctor-page">
          <header className="page-content-header">
            <h1>Find a Specialist</h1>
            <p>Connect with top-rated doctors in your area</p>
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
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </section>

          {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

          <div className="doctor-grid">
            {filteredDoctors.map(doc => (
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
                  <button 
                  className="btn-book" 
                  onClick={() => handleBookAppointment(doc)} // Pass the whole doc object
                >
                  Book Appointment
                </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && doctors.length === 0 && (
            <EmptyState
              icon="🔍"
              title="No doctors found"
              description="Enter your zip code and search to find doctors nearby."
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default FindDoctor;
