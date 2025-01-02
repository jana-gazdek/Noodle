const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  OIB: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  dateTimeOfRequest: { type: Date, required: true },
  primarySchool: { type: String, required: true },
  role: { type: String, default: 'user' }
});

module.exports = mongoose.model('Student', studentSchema);
