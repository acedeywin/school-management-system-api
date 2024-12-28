module.exports = class AuthController {
  constructor({ authManager }) {
    this.authManager = authManager
  }

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
        return res.status(400).json({ success: false, error: result.error })
      }

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      // next()
      return res.status(403).json({ error })
    }
  }

  async logout(req, res) {
    try {
      const { token } = req.query

      const result = await this.authManager.logout({ token })

      // Check for errors in the result
      if (result.error) {
        return res.status(400).json({ success: false, error: result.error })
      }

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ error })
    }
  }
}
