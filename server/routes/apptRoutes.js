const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments');

// Doctor adds available slots
router.post('/doctor/availability', appointmentsController.addAvailability);

// Get available slots for a doctor
router.get('/doctor/slots/:doctorId', appointmentsController.getAvailableSlots);

// Book an appointment (patient)
router.post('/book', appointmentsController.bookAppointment);
router.get('/getPatientApp/:patientId', appointmentsController.getUpcomingPatient);
router.get('/getDoctorApp/:doctorId', appointmentsController.getUpcomingDoctorAppointments);

module.exports = router;