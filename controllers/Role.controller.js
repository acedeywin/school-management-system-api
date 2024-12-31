module.exports = class RoleController {
  /**
   * @constructor
   * @param {Object} options - Dependencies for the RoleController
   * @param {Object} options.roleManager - Instance of RoleManager to handle role logic
   */
  constructor({ roleManager }) {
    this.roleManager = roleManager
  }

  /**
   * Handles role creation
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing role details
   * @param {string} req.body.permission - Permission name for the new role
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with creation result
   */
  async createRole(req, res) {
    try {
      const { permission } = req.body

      const result = await this.roleManager.createRole({ permission })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Handles fetching all roles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with roles result
   */
  async getRoles(req, res) {
    try {
      const result = await this.roleManager.getRoles()

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

  /**
   * Handles fetching a role by ID
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters of the request
   * @param {string} req.query.roleId - ID of the role to fetch
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with role result
   */
  async getRoleById(req, res) {
    try {
      const { roleId } = req.query

      const result = await this.roleManager.getRoleById({ roleId })

      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error })
      }

      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }
}
