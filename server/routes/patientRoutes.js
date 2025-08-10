const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient');

// GET /api/patient/findDoctors/:zip
router.get('/findDoctors/:zip', patientController.findDoctorsByZip);

module.exports = router;
