const express = require('express');
const multer = require('multer');
const router = express.Router();
const patientController = require('../controllers/patient');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/profile/me', protect, patientController.getPatientProfile);
router.put('/profile/me', protect, patientController.updatePatientProfile);
router.get('/findDoctors/:zip', patientController.findDoctorsByZip);
router.post('/copilot/analyze', patientController.analyzeChart);
router.post('/copilot/normalize', patientController.normalizeChart);
router.post('/copilot/upload', upload.single('file'), patientController.uploadChart);

module.exports = router;
