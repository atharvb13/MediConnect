import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Common/Sidebar';
import Calendar from 'react-calendar';
import { FiCalendar, FiClock, FiUser, FiChevronLeft, FiAlertCircle } from 'react-icons/fi';
import 'react-calendar/dist/Calendar.css';
import './appointment.css';

const AppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId, doctorName } = location.state || {};
  const patientId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole');

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!doctorId) {
      navigate('/patient/find-doctor');
      return;
    }
    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`http://localhost:5001/api/appointments/doctor/slots/${doctorId}`);
        setSlots(res.data);
      } catch (err) {
        setError('Could not load availability.');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableSlots();
  }, [doctorId, navigate]);

  const slotsByDate = slots.reduce((acc, slot) => {
    const dateStr = new Date(slot.slot).toISOString().slice(0, 10);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(slot);
    return acc;
  }, {});

  const selectedDateStr = selectedDate.toISOString().slice(0, 10);
  const slotsForSelectedDate = slotsByDate[selectedDateStr] || [];

  // Step 1: Open confirmation popup
  const triggerConfirmation = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  // Step 2: Final API Call
  const handleFinalBooking = async () => {
    setIsBooking(true);
    try {
      await axios.post(`http://localhost:5001/api/appointments/book`, {
        doctorId,
        patientId,
        slotId: selectedSlot._id
      });
      setShowModal(false);
      alert("Appointment successfully booked!");
      navigate('/my-appointments');
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      if (slotsByDate[dateStr]) return 'calendar-has-slot';
    }
    return null;
  };

  return (
    <div className="layout-wrapper appointment-bg">
      <Sidebar role={role} />
      <div className="main-content">
        
        <div className="appointment-hero">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiChevronLeft /> Back to Search
          </button>
          <div className="hero-content">
            <div className="doctor-avatar-circle">
               <FiUser size={40} />
            </div>
            <div className="hero-text">
              <h1>Book with {doctorName || 'your Specialist'}</h1>
              <p>Select your preferred date and time to secure your consultation.</p>
            </div>
          </div>
        </div>

        <div className="booking-grid">
          <div className="calendar-card">
            <div className="card-header">
              <FiCalendar className="card-icon" />
              <h3>Select Date</h3>
            </div>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              tileClassName={tileClassName}
            />
          </div>

          <div className="slots-card">
            <div className="card-header">
              <FiClock className="card-icon" />
              <h3>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
            </div>
            
            <div className="slots-scroll-area">
              {slotsForSelectedDate.length > 0 ? (
                <div className="slots-grid">
                  {slotsForSelectedDate.map((slot) => (
                    <div key={slot._id} className="modern-slot-card">
                      <span className="time-label">
                        {new Date(slot.slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        className="confirm-btn"
                        onClick={() => triggerConfirmation(slot)}
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-slots">
                  <FiCalendar size={48} />
                  <p>No slots available for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showModal && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <div className="modal-header">
                <FiAlertCircle className="warning-icon" />
                <h2>Confirm Appointment</h2>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to book an appointment with <strong>{doctorName}</strong>?</p>
                <div className="confirmation-details">
                  <div className="detail-row">
                    <FiCalendar /> <span>{new Date(selectedSlot.slot).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <FiClock /> <span>{new Date(selectedSlot.slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowModal(false)} disabled={isBooking}>
                  Go Back
                </button>
                <button className="booking-confirm-btn" onClick={handleFinalBooking} disabled={isBooking}>
                  {isBooking ? "Confirming..." : "Confirm & Book"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentPage;