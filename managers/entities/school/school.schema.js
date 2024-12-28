const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  website: { type: String },
  administrators: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  classrooms: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
    });

module.exports =  mongoose.model('School', SchoolSchema);

// Once superadmin creates a school, the superadmin will an administrator
// and also add a school admin too.
