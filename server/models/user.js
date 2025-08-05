const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  role: { type: String, enum: ['patient', 'doctor', 'admin'] },
  location: {
    city: String,
    state: String,
    country: String
  },
  isVerified: { type: Boolean, default: false },
  approvedByAdmin: { type: Boolean, default: false },
  qualification: String, 
  medicalLicenseId: String,
  googleId: String,
});

module.exports = mongoose.model('User', userSchema);