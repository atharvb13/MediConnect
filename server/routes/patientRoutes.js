const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient');
const { protect } = require('../middleware/auth');

router.get('/profile/me', protect, patientController.getPatientProfile);
router.put('/profile/me', protect, patientController.updatePatientProfile);
router.get('/findDoctors/:zip', patientController.findDoctorsByZip);
router.post('/predict', patientController.predict);

module.exports = router;
