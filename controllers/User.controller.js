module.exports = class UserController {
  /**
   * @constructor
   * @param {Object} dependencies - Dependencies for UserController
   * @param {Object} dependencies.userManager - Instance of UserManager for user-related business logic
   */
  constructor({ userManager }) {
    this.userManager = userManager
  }

  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body

      // Call to userManager to create a user
      const result = await this.userManager.createUser({
        username,
        email,
        password,
        role
      })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Create a superadmin user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async createSuperadmin(req, res) {
    try {
      const { username, email, password } = req.body

      const result = await this.userManager.createSuperadmin({
        username,
        email,
        password
      })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Get a paginated list of users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getUsers(req, res) {
    try {
      const { page, limit } = req.query

      const result = await this.userManager.getUsers({ page, limit })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Get user details by user ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getuserById(req, res) {
    try {
      const { userId } = req.query
      const adminId = req.user.userId
      const permission = req.user.userKey

      const result = await this.userManager.getuserById({
        adminId,
        userId,
        permission
      })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Update a user's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.query
      const adminId = req.user.userId
      const permission = req.user.userKey

      const result = await this.userManager.updateUserProfile({
        adminId,
        userId,
        permission,
        updates: req.body
      })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Delete a user's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async deleteUserProfile(req, res) {
    try {
      const { userId } = req.query
      const adminId = req.user.userId

      const result = await this.userManager.deleteUserProfile({
        adminId,
        userId
      })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }
}

/**
 * @file userRoutes.js
 * @description Defines and initializes routes for user-related operations.
 */
