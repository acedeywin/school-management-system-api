module.exports = class AuthController {
  /**
   * @constructor
   * @param {Object} options - Dependencies for the AuthController
   * @param {Object} options.authManager - Instance of AuthManager to handle authentication logic
   */
  constructor({ authManager }) {
    this.authManager = authManager
  }

  /**
   * Handles user login
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing login details
   * @param {string} req.body.identifier - Email or username of the user
   * @param {string} req.body.password - Password of the user
   * @param {Object} req.device - Device information of the user
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with login result
   */
  async login(req, res) {
    try {
      const { identifier, password } = req.body
      const deviceInfo = req.device

      const result = await this.authManager.login({
        identifier,
        password,
        deviceInfo
      })

      // Check for errors in the result
      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      // next()
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Handles user logout
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters of the request
   * @param {string} req.query.token - Authentication token to be invalidated
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with logout result
   */
  async logout(req, res) {
    try {
      const { token } = req.query

      const result = await this.authManager.logout({ token })

      // Check for errors in the result
      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }
}
