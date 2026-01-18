const express = require('express');
const  doctorController= require('../controllers/doctor');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/profile/me', protect, doctorController.getDoctorProfile);
router.put('/profile/me', protect, doctorController.updateDoctorProfile);


module.exports = router;