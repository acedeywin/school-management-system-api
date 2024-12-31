const mongoose = require('mongoose')

const ClassroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  capacity: { type: Number, required: true }, // Maximum students
  resources: [String], // e.g., ["Projector", "Whiteboard"]
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Classroom', ClassroomSchema)
