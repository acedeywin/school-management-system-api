module.exports = class ClassroomController {
  constructor({ classroomManager }) {
    this.classroomManager = classroomManager
  }

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

  async getClassroomById(req, res) {
    try {
      const { classroomId } = req.query
      const adminId = req.user.userId

      const result = await this.classroomManager.getClassroomById({
        classroomId,
        adminId
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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }

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

      // Successful creation
      return res.status(201).json(result)
    } catch (error) {
      return res.status(403).json({ errors: error })
    }
  }
}
