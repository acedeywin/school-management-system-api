const mongoose = require('mongoose')

const ClassroomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Class 1A"
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, // Admin managing the classroom
  capacity: { type: Number, required: true }, // Maximum students
  resources: [String], // e.g., ["Projector", "Whiteboard"]
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Classroom', ClassroomSchema)
