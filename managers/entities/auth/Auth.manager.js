const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = class Auth {
  constructor({ config, managers, userModels, roleModels } = {}) {
    this.config = config
    this.userModels = userModels
    this.roleModels = roleModels
    this.tokenManager = managers.token
    this.authsCollection = 'Auths'
    this.authExposed = ['login', 'logout']
  }

  async login({ identifier, password, deviceInfo }) {
    const user = this.userModels.user
    const roles = await this.roleModels.role
    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    const error = 'Invalid email or password.'

    // Find the user by email or username
    const isUser = await user.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    })

    if (!isUser) {
      return { errors: error }
    }

    const { _id, username, email, role, password: hashedPassword } = isUser

    // Compare passwords
    const isMatch = await bcrypt.compare(password, hashedPassword)
    if (!isMatch) {
      return { errors: error }
    }

    const { permission } = await roles.findOne({ _id: role })

    // // Generate long token
    const longToken = this.tokenManager.genLongToken({
      userId: _id,
      userKey: permission
    })

    // Generate short token
    const shortToken = this.tokenManager.v1_createShortToken({
      __longToken: longToken,
      __device: deviceInfo
    })

    return {
      success: true,
      message: 'Logged in successfully.',
      data: {
        id: _id,
        username,
        email,
        role: permission
      },
      tokens: shortToken
    }
  }

  async logout({ token }) {
    // Add the token to the blacklist
    const decoded = jwt.decode(token)
    if (!decoded) {
      return { errors: 'Invalid token' }
    }

    const blacklisted = await this.tokenManager.isBlacklisted(token)

    if (blacklisted) {
      return { errors: 'You are already logged out' }
    }

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
    await this.tokenManager.addToBlacklist(token, expiresIn)

    return { success: true, message: 'Logged out successfully.' }
  }
}
