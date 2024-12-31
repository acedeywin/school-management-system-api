module.exports = class StudentController {
  /**
   * @constructor
   * @param {Object} studentManager - Manager instance for handling student operations.
   */
  constructor({ studentManager }) {
    this.studentManager = studentManager
  }

  /**
   * Handles enrolling a student into a school and classroom.
   * @param {Object} req - Express request object.
   * @param {Object} req.body - Request body.
   * @param {string} firstName - First name of the student.
   * @param {string} lastName - Last name of the student.
   * @param {string} email - Email address of the student.
   * @param {string} phoneNumber - Phone number of the student.
   * @param {Date} dateOfBirth - Date of birth of the student.
   * @param {Object} req.query - Request query parameters.
   * @param {string} schoolId - ID of the school.
   * @param {string} classroomId - ID of the classroom.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with enrollment result.
   */
  async enrollStudent(req, res) {
    try {
      const { firstName, lastName, email, phoneNumber, dateOfBirth } = req.body
      const { schoolId, classroomId } = req.query

      const result = await this.studentManager.enrollStudent({
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        schoolId,
        classroomId
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
   * Handles transferring a student to a new school and/or classroom.
   * @param {Object} req - Express request object.
   * @param {Object} req.body - Request body containing transfer history.
   * @param {Object} transferHistory - Details of the transfer operation.
   * @param {string} transferHistory.toSchool - ID of the new school.
   * @param {string} transferHistory.toClassroom - ID of the new classroom.
   * @param {Date} transferHistory.transferDate - Date of the transfer.
   * @param {Object} req.query - Request query parameters.
   * @param {string} studentId - ID of the student to transfer.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with transfer result.
   */
  async transferStudent(req, res) {
    try {
      const { toSchool, toClassroom, transferDate } = req.body.transferHistory
      const { studentId } = req.query

      const result = await this.studentManager.transferStudent({
        toSchool,
        toClassroom,
        transferDate,
        studentId
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
   * Retrieves a list of students in a specified school.
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Request query parameters.
   * @param {string} schoolId - ID of the school.
   * @param {number} [page=1] - Page number for pagination.
   * @param {number} [limit=10] - Number of records per page.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with students list.
   */
  async getStudents(req, res) {
    try {
      const { schoolId, page = 1, limit = 10 } = req.query
      const adminId = req.user.userId

      const result = await this.studentManager.getStudents({
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
   * Retrieves details of a specific student by ID.
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Request query parameters.
   * @param {string} studentId - ID of the student.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with student details.
   */
  async getStudentById(req, res) {
    try {
      const { studentId } = req.query
      const adminId = req.user.userId

      const result = await this.studentManager.getStudentById({
        studentId,
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
   * Updates details of a student.
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Request query parameters.
   * @param {string} studentId - ID of the student to update.
   * @param {Object} req.body - Request body containing updates.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with updated student details.
   */
  async updateStudent(req, res) {
    try {
      const { studentId } = req.query
      const adminId = req.user.userId

      const result = await this.studentManager.updateStudent({
        studentId,
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
   * Deletes a student by ID.
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Request query parameters.
   * @param {string} studentId - ID of the student to delete.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with deletion result.
   */
  async deleteStudent(req, res) {
    try {
      const { studentId } = req.query
      const adminId = req.user.userId

      const result = await this.studentManager.deleteStudent({
        studentId,
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
