module.exports = class Auth {
  /**
   * @constructor
   * @param {Object} options - Dependencies for the Auth class
   * @param {Object} options.utils - Utility libraries like bcrypt and jwt
   * @param {Object} options.config - Application configuration
   * @param {Object} options.managers - Manager instances including token manager
   * @param {Object} options.userModels - MongoDB models for users
   * @param {Object} options.roleModels - MongoDB models for roles
   */
  constructor({ utils, config, managers, userModels, roleModels } = {}) {
    this.bcrypt = utils.bcrypt
    this.jwt = utils.jwt
    this.config = config
    this.userModels = userModels
    this.roleModels = roleModels
    this.tokenManager = managers.token
    this.authsCollection = 'Auths'
    this.authExposed = ['login', 'logout']
  }

  /**
   * Logs in a user
   * @param {Object} loginDetails - Login details
   * @param {string} loginDetails.identifier - Email or username of the user
   * @param {string} loginDetails.password - Password of the user
   * @param {Object} loginDetails.deviceInfo - Information about the user's device
   * @returns {Object} Result of the login operation
   */
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
    const isMatch = await this.bcrypt.compare(password, hashedPassword)
    if (!isMatch) {
      return { errors: error }
    }

    const { permission } = await roles.findOne({ _id: role })

    // Generate long token
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
      token: shortToken
    }
  }

  /**
   * Logs out a user
   * @param {Object} logoutDetails - Logout details
   * @param {string} logoutDetails.token - Token to be invalidated
   * @returns {Object} Result of the logout operation
   */
  async logout({ token }) {
    // Add the token to the blacklist
    const decoded = this.jwt.decode(token)
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
