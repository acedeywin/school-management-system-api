/**
 * Middleware to validate the enrollment of a student into a classroom within a school.
 *
 * @param {Object} managers - Manager objects to handle operations and dispatch responses.
 * @param {Object} mongoModels - MongoDB models for accessing school, classroom, and student collections.
 * @returns {Function} Middleware function to validate the request.
 */
module.exports = ({ managers, mongoModels }) => {
  return async (req, res, next) => {
    try {
      const { classroomModels, schoolModels, studentModels } = mongoModels

      const classroom = classroomModels.classroom
      const school = schoolModels.school
      const student = studentModels.student

      const adminId = req.user.userId
      const { classroomId, schoolId } = req.query

      if (!classroom || !school || !student) {
        return res.status(500).json({
          ok: false,
          code: 500,
          errors: 'Classroom or School or Student model is not loaded.'
        })
      }

      // Verify if the school exists
      const isSchool = await school.findById(schoolId)

      if (!isSchool) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'School not found.'
        })
      }

      // Verify if the administrator is associated with the school
      if (!isSchool.administrators.includes(adminId)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors:
            'The provided administrator is not associated with this school.'
        })
      }

      // Verify if the classroom is associated with the school
      if (!isSchool.classrooms.includes(classroomId)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'The provided classroom is not associated with this school.'
        })
      }

      // Check if the classroom exists
      const isClassroom = await classroom.findById(classroomId)

      if (!isClassroom) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'Classroom not found.'
        })
      }

      // Check if the classroom has reached its maximum capacity
      if (isClassroom.students.length === isClassroom.capacity) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'The provided classroom has reached its maximum capacity.'
        })
      }

      next()
    } catch (error) {
      console.error(error)
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Something went wrong.'
      })
    }
  }
}
