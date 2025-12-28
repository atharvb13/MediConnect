const User = require('../models/user');

// GET /api/patient/findDoctors/:zip
exports.findDoctorsByZip = async (req, res) => {
  const { zip } = req.params;
  try {
    // Only approved doctors in this zip
    const doctors = await User.find({ role: 'doctor', approvedByAdmin: true, zip });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

exports.predict = async (req, res) => {
  try {
    const { symptoms, top_k = 2 } = req.body;

    const r = await fetch("http://localhost:5002/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms, top_k }),
    });

    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Prediction failed" });
  }
};
