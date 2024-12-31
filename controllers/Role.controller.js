module.exports = class RoleController {
  constructor({ roleManager }) {
    this.roleManager = roleManager
  }

  async createRole(req, res) {
    try {
      const { permission } = req.body

      const result = await this.roleManager.createRole({ permission })

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

  async getRoles(req, res) {
    try {
      const result = await this.roleManager.getRoles()

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

  async getRoleById(req, res) {
    try {
      const { roleId } = req.query

      const result = await this.roleManager.getRoleById({ roleId })

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
