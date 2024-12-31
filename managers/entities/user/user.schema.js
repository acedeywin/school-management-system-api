const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    schools: [{ type: mongoose.Schema.Types.ObjectId, ref: 'School' }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
