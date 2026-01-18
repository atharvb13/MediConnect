const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slot: { type: Date, required: true }, 
  isBooked: { type: Boolean, default: false }
});
// Find slots for a doctor quickly
availabilitySchema.index({ doctorId: 1, slot: 1 });

// Prevent duplicate time slots for the same doctor
availabilitySchema.index(
  { doctorId: 1, slot: 1 },
  { unique: true }
);

// Fast filtering of open slots
availabilitySchema.index({ isBooked: 1 });
module.exports = mongoose.model('Availability', availabilitySchema);
