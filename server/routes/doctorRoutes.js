const express = require('express');
const multer = require('multer');
const doctorController = require('../controllers/doctor');
const copilotController = require('../controllers/copilot');
const router = express.Router();
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/profile/me', protect, doctorController.getDoctorProfile);
router.put('/profile/me', protect, doctorController.updateDoctorProfile);
router.post('/copilot/analyze', copilotController.analyzeChart);
router.post('/copilot/normalize', copilotController.normalizeChart);
router.post('/copilot/upload', upload.single('file'), copilotController.uploadChart);

module.exports = router;