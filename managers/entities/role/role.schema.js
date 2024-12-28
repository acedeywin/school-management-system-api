const mongoose = require('mongoose')

const RoleSchema = new mongoose.Schema({
  permission: {
    type: String,
    enum: ['superadmin', 'schooladmin'],
    required: true,
    unique: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Role', RoleSchema)
