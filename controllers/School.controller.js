module.exports = class SchoolController {
  constructor({ schoolManager }) {
    this.schoolManager = schoolManager
  }

  async createSchool(req, res) {
    try {
      const { name, address, phoneNumber, email, website, administrators } =
        req.body

      const result = await this.schoolManager.createSchool({
        name,
        address,
        phoneNumber,
        email,
        website,
        administrators
      })

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

  async getSchools(req, res) {
    try {
      const adminId = req.user.userId
      const { page, limit } = req.query

      const result = await this.schoolManager.getSchools({
        adminId,
        page,
        limit
      })

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

  async getSchoolById(req, res) {
    try {
      const { schoolId } = req.query
      const adminId = req.user.userId

      const result = await this.schoolManager.getSchoolById({
        schoolId,
        adminId
      })

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

  async updateSchool(req, res) {
    try {
      const { schoolId } = req.query
      const superadminId = req.user.userId

      const result = await this.schoolManager.updateSchool({
        schoolId,
        updates: req.body,
        superadminId
      })

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

  async deleteSchool(req, res) {
    // try {
    const { schoolId } = req.query
    const superadminId = req.user.userId

    const result = await this.schoolManager.deleteSchool({
      schoolId,
      superadminId
    })

    console.log('result is here', result)

    // Check for errors in the result
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error })
    }

    // Successful creation
    return res.status(201).json(result)

    // } catch (error) {
    //     return res.status(403).json({ error })
    // }
  }
}
