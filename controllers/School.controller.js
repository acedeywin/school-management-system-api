module.exports = class SchoolController {
  /**
   * @constructor
   * @param {Object} options - Dependencies for the SchoolController
   * @param {Object} options.schoolManager - Instance of SchoolManager to handle school logic
   */
  constructor({ schoolManager }) {
    this.schoolManager = schoolManager
  }

  /**
   * Handles school creation
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing school details
   * @param {string} req.body.name - Name of the school
   * @param {string} req.body.address - Address of the school
   * @param {string} req.body.phoneNumber - Phone number of the school
   * @param {string} req.body.email - Email address of the school
   * @param {string} req.body.website - Website URL of the school
   * @param {Array<string>} req.body.administrators - List of administrator IDs
   * @param {Object} req.user - Authenticated user information
   * @param {string} req.user.userId - ID of the authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with creation result
   */
  async createSchool(req, res) {
    try {
      const { name, address, phoneNumber, email, website, administrators } =
        req.body

      const adminId = req.user.userId

      const result = await this.schoolManager.createSchool({
        name,
        address,
        phoneNumber,
        email,
        website,
        administrators,
        adminId
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
   * Fetches all schools associated with the authenticated administrator
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {number} req.query.page - Page number for pagination
   * @param {number} req.query.limit - Number of records per page
   * @param {Object} req.user - Authenticated user information
   * @param {string} req.user.userId - ID of the authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with schools result
   */
  async getSchools(req, res) {
    try {
      const adminId = req.user.userId
      const { page, limit } = req.query

      const result = await this.schoolManager.getSchools({
        adminId,
        page,
        limit
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
   * Fetches a school by its ID
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.schoolId - ID of the school to fetch
   * @param {Object} req.user - Authenticated user information
   * @param {string} req.user.userId - ID of the authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with the school result
   */
  async getSchoolById(req, res) {
    try {
      const { schoolId } = req.query
      const adminId = req.user.userId

      const result = await this.schoolManager.getSchoolById({
        schoolId,
        adminId
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
   * Updates a school
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.schoolId - ID of the school to update
   * @param {Object} req.body - Request body containing updates
   * @param {Object} req.user - Authenticated user information
   * @param {string} req.user.userId - ID of the authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with update result
   */
  async updateSchool(req, res) {
    try {
      const { schoolId } = req.query
      const superadminId = req.user.userId

      const result = await this.schoolManager.updateSchool({
        schoolId,
        updates: req.body,
        superadminId
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
   * Deletes a school
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.schoolId - ID of the school to delete
   * @param {Object} req.user - Authenticated user information
   * @param {string} req.user.userId - ID of the authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with deletion result
   */
  async deleteSchool(req, res) {
    const { schoolId } = req.query
    const superadminId = req.user.userId

    const result = await this.schoolManager.deleteSchool({
      schoolId,
      superadminId
    })

    console.log('result is here', result)

    if (result.error) {
      return res.status(400).json({ success: false, errors: result.error })
    }

    return res.status(201).json(result)
  }
}
