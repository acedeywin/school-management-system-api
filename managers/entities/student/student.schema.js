const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  transferHistory: [
    {
      fromSchool: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
      toSchool: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
      transferDate: { type: Date }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Student', StudentSchema)
