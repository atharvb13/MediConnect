const express = require('express');
const { getPendingDoctors, getAllDoctors,approveDoctor } = require('../controllers/admin');
const router = express.Router();

router.get('/pending-doctors', getPendingDoctors);
router.get('/all-doctors', getAllDoctors);
router.post('/approve-doctor', approveDoctor);

module.exports = router;