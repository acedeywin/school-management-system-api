module.exports = class ClassroomController {
  /**
   * @constructor
   * @param {Object} params - Dependencies for the ClassroomController
   * @param {Object} params.classroomManager - Instance of ClassroomManager
   */
  constructor({ classroomManager }) {
    this.classroomManager = classroomManager
  }

  /**
   * Create a new classroom
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing classroom details
   * @param {string} req.body.name - Name of the classroom
   * @param {number} req.body.capacity - Maximum capacity of the classroom
   * @param {Array} req.body.resources - Resources available in the classroom
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.schoolId - ID of the school
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with the result
   */
  async createClassroom(req, res) {
    try {
      const { name, capacity, resources } = req.body
      const { schoolId } = req.query
      const adminId = req.user.userId

      const result = await this.classroomManager.createClassroom({
        name,
        schoolId,
        capacity,
        resources,
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
   * Fetch classrooms for a school
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.schoolId - ID of the school
   * @param {number} [req.query.page] - Page number for pagination
   * @param {number} [req.query.limit] - Number of items per page
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with the result
   */
  async getClassrooms(req, res) {
    try {
      const { schoolId, page, limit } = req.query
      const adminId = req.user.userId

      const result = await this.classroomManager.getClassrooms({
        adminId,
        schoolId,
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
   * Fetch a specific classroom by ID
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.classroomId - ID of the classroom
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with the result
   */
  async getClassroomById(req, res) {
    try {
      const { classroomId } = req.query
      const adminId = req.user.userId

      const result = await this.classroomManager.getClassroomById({
        classroomId,
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
   * Update a classroom
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.classroomId - ID of the classroom to update
   * @param {Object} req.body - Request body containing updates
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with the result
   */
  async updateClassroom(req, res) {
    try {
      const { classroomId } = req.query
      const adminId = req.user.userId

      const result = await this.classroomManager.updateClassroom({
        classroomId,
        updates: req.body,
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
   * Delete a classroom
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.classroomId - ID of the classroom to delete
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Sends a JSON response with the result
   */
  async deleteClassroom(req, res) {
    try {
      const { classroomId } = req.query
      const adminId = req.user.userId

      const result = await this.classroomManager.deleteClassroom({
        classroomId,
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
}
