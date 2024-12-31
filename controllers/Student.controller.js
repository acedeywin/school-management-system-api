module.exports = class StudentController {
  constructor({ studentManager }) {
    this.studentManager = studentManager
  }

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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }
}
