const mongoose = require('mongoose');

const ApptSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Appointment', ApptSchema);
