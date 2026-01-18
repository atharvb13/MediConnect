import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import Sidebar from '../Common/Sidebar';
import { FiClock, FiPlus, FiX } from 'react-icons/fi';
import 'react-calendar/dist/Calendar.css';
import './doctorAvailability.css';

const DEFAULT_TIMES = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const DoctorAvailability = ({ userId }) => {
  const role = localStorage.getItem('userRole');
  const doctorId = userId || localStorage.getItem('userId');

  const [date, setDate] = useState(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [manualTime, setManualTime] = useState("");
  const [repeatType, setRepeatType] = useState("none"); // none, week, month
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch upcoming appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/appointments/doctor/${doctorId}`);
        // API now returns: [{ slot, patientName, patientEmail, status }]
        const formatted = res.data.map(app => ({
          slot: app.slot,
          patientName: app.patientName || 'Unknown',
          patientEmail: app.patientEmail || '',
          status: app.status
        }));
        setUpcomingAppointments(formatted);
      } catch (err) {
        setUpcomingAppointments([]);
      }
    };
    fetchAppointments();
  }, [doctorId]);

  // Fetch existing slots for selected date
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await axios.get(`http://localhost:5001/api/appointments/doctor/slots/${doctorId}`);
        const selectedDateStr = date.toISOString().slice(0, 10);
        const slotsForDate = res.data
          .filter(s => s.slot.slice(0, 10) === selectedDateStr)
          .map(s => {
            const d = new Date(s.slot);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          });
        setExistingSlots(slotsForDate);
      } catch (err) {
        setExistingSlots([]);
      }
      setLoadingSlots(false);
    };
    fetchSlots();
  }, [doctorId, date]);

  const addManualSlot = () => {
    if (
      manualTime &&
      !availabilitySlots.includes(manualTime) &&
      !existingSlots.includes(manualTime)
    ) {
      setAvailabilitySlots([...availabilitySlots, manualTime].sort());
      setManualTime("");
    }
  };

  const addDefaultSlot = (time) => {
    if (
      !availabilitySlots.includes(time) &&
      !existingSlots.includes(time)
    ) {
      setAvailabilitySlots([...availabilitySlots, time].sort());
    }
  };

  const removeSlot = (timeToRemove) => {
    setAvailabilitySlots(availabilitySlots.filter(t => t !== timeToRemove));
  };

  // Helper to get all weekdays in week/month for selected date
  const getDatesForRepeat = () => {
    const dates = [];
    const baseDate = new Date(date);
    if (repeatType === "week") {
      // Get Mon-Fri of the week containing baseDate
      const day = baseDate.getDay();
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() - ((day + 6) % 7)); // Monday
      for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
      }
    } else if (repeatType === "month") {
      // Get all Mon-Fri of the month of baseDate
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const curr = new Date(year, month, d);
        const day = curr.getDay();
        if (day >= 1 && day <= 5) dates.push(curr);
      }
    } else {
      dates.push(baseDate);
    }
    return dates;
  };

  const saveSlots = async () => {
  try {
    const dates = getDatesForRepeat();
    const fullSlots = [];
    dates.forEach(d => {
      availabilitySlots.forEach(t => {
        const [h, m] = t.split(':');
        // Use UTC to avoid timezone issues!
        const slotDate = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            parseInt(h),
            parseInt(m),
            0,
            0
          );
        console.log('Slot being sent:', slotDate, slotDate.toISOString());
        fullSlots.push(slotDate.toISOString());
      });
    });

    await axios.post('http://localhost:5001/api/appointments/doctor/availability', {
      doctorId,
      slots: fullSlots
    });

    alert("Availability updated successfully!");
    setAvailabilitySlots([]);
  } catch (err) {
    console.error("Error saving slots:", err);
    alert("Failed to save slots.");
  }
};

  return (
    <div className="profile-layout">
      <Sidebar role={role} />

      <div className="profile-main-content">
        <div className="dashboard-grid">
          {/* Left Column: Appointments */}
          <div className="appointments-section">
            <h3 className="section-title">Upcoming Appointments</h3>
            <div className="appointments-list">
              {upcomingAppointments.length === 0 && <div>No upcoming appointments.</div>}
              {upcomingAppointments.map((app, idx) => (
                <div key={idx} className="modern-app-card">
                  <div className="app-date-badge">
                    <span className="app-day">{new Date(app.slot).getDate()}</span>
                    <span className="app-month">{new Date(app.slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="app-info">
                    <h4>{app.patientName}</h4>
                    <p style={{ fontSize: 13, color: "#888" }}>{app.patientEmail}</p>
                    <p><FiClock className="icon" /> {new Date(app.slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <span style={{
                      fontSize: 12,
                      color: app.status === "scheduled" ? "#6366f1" : "#64748b",
                      fontWeight: 600,
                      textTransform: "capitalize"
                    }}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Availability Management */}
          <div className="availability-card">
            <h3 className="section-title">Set Your Availability</h3>
            
            <div className="calendar-styled-wrapper">
              <Calendar onChange={setDate} value={date} minDate={new Date()} />
            </div>

            <div className="slots-selection-section">
              <div className="manual-time-input">
                <label>Add Specific Time Slot</label>
                <div className="input-group">
                  <input 
                    type="time" 
                    value={manualTime} 
                    onChange={(e) => setManualTime(e.target.value)}
                    className="time-input-field"
                  />
                  <button type="button" onClick={addManualSlot} className="add-slot-btn">
                    <FiPlus /> Add
                  </button>
                </div>
              </div>

              <div className="default-times-options">
                <label>Quick Add:</label>
                <div className="default-times-grid">
                  {DEFAULT_TIMES.map(time => (
                    <button
                      key={time}
                      className={`default-time-btn${availabilitySlots.includes(time) || existingSlots.includes(time) ? ' selected' : ''}`}
                      onClick={() => addDefaultSlot(time)}
                      disabled={availabilitySlots.includes(time) || existingSlots.includes(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="repeat-options">
              <label>Repeat for:</label>
              <select value={repeatType} onChange={e => setRepeatType(e.target.value)}>
                <option value="none">Selected Day Only</option>
                <option value="week">Whole Week (Mon-Fri)</option>
                <option value="month">Whole Month (Mon-Fri)</option>
              </select>
            </div>

            <div className="selected-slots-container">
              <p className="label-text">
                Selected Slots for {date.toLocaleDateString()}:
                {loadingSlots && <span style={{ marginLeft: 10, fontSize: 12, color: "#888" }}>Loading...</span>}
              </p>
              <div className="slots-chip-grid">
                {existingSlots.map(t => (
                  <div key={t} className="time-chip existing">
                    {t}
                  </div>
                ))}
                {availabilitySlots.map(t => (
                  <div key={t} className="time-chip">
                    {t}
                    <button onClick={() => removeSlot(t)} className="remove-chip-btn"><FiX /></button>
                  </div>
                ))}
                {existingSlots.length === 0 && availabilitySlots.length === 0 && (
                  <span className="placeholder">No slots added yet...</span>
                )}
              </div>
              {existingSlots.length > 0 && (
                <div className="existing-slots-note">
                  <span style={{ fontSize: 12, color: "#888" }}>
                    <b>Note:</b> Existing slots cannot be added again.
                  </span>
                </div>
              )}
            </div>

            <button
              className="save-btn-primary"
              onClick={saveSlots}
              disabled={availabilitySlots.length === 0}
            >
              Confirm Availability
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;