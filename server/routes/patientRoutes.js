const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient');

router.get('/findDoctors/:zip', patientController.findDoctorsByZip);
router.post('/predict', patientController.predict);

module.exports = router;
