const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments');

// Doctor adds available slots
router.post('/doctor/availability', appointmentsController.addAvailability);

// Get available slots for a doctor
router.get('/doctor/slots/:doctorId', appointmentsController.getAvailableSlots);

// Book an appointment (patient)
router.post('/book', appointmentsController.bookAppointment);

// (Optional) Get all appointments for a patient
router.get('/patient/:patientId', appointmentsController.getPatientAppointments);

// (Optional) Get all appointments for a doctor
router.get('/doctor/:doctorId', appointmentsController.getDoctorAppointments);

module.exports = router;