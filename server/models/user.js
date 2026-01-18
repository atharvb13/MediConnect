const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  dob: Date,
  role: { type: String, enum: ['patient', 'doctor', 'admin'] },
  location: {
    city: String,
    state: String,
    country: String
  },
  gender: { type: String, enum: ['Male', 'Female', 'Other']},
  zip: String, // For easier doctor search by zip
  isVerified: { type: Boolean, default: false },
  approvedByAdmin: { type: Boolean, default: false },
  qualification: String, 
  medicalLicenseId: String,
  profession: String,
  clinicAddress: String,
  googleId: String,
});

// Login & identity
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 });

// Role-based queries
userSchema.index({ role: 1 });

// Doctor search optimizations
userSchema.index({ zip: 1 });
userSchema.index({ "location.city": 1, role: 1 });
userSchema.index({ approvedByAdmin: 1, isVerified: 1 });

// Compound index for doctor discovery
userSchema.index({
  role: 1,
  zip: 1,
  approvedByAdmin: 1,
  isVerified: 1
});


module.exports = mongoose.model('User', userSchema);