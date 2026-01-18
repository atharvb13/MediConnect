const mongoose = require('mongoose');

// models/Appointment.js
const apptSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Availability', required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

// Fast lookup for doctor dashboards
apptSchema.index({ doctorId: 1, createdAt: -1 });

// Fast lookup for patient history
apptSchema.index({ patientId: 1, createdAt: -1 });

// Ensure one appointment per slot
apptSchema.index({ slotId: 1 }, { unique: true });

// Status-based queries (e.g., upcoming, cancelled)
apptSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', apptSchema);
