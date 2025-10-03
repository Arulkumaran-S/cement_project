const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  dob: String,
  gender: String,
  aadhar: String,
  experience: Number,
  shift: String,
  attendance: [Date] // Optional
});

module.exports = mongoose.model('Employee', employeeSchema);
