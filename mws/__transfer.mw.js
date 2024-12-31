/**
 * Middleware to validate and verify the transfer process for a student.
 *
 * @param {Object} managers - Manager objects for handling responses and operations.
 * @param {Object} mongoModels - MongoDB models for schools, classrooms, and students.
 * @returns {Function} Middleware function to validate transfer operations.
 */
module.exports = ({ managers, mongoModels }) => {
  return async (req, res, next) => {
    try {
      const { classroomModels, schoolModels, studentModels } = mongoModels

      const adminId = req.user.userId
      const { studentId } = req.query
      const { toSchool, toClassroom } = req.body.transferHistory

      const classroom = classroomModels.classroom
      const school = schoolModels.school
      const student = studentModels.student

      if (!classroom || !school || !student) {
        return res.status(500).json({
          ok: false,
          code: 500,
          errors: 'Classroom or School or Student model is not loaded.'
        })
      }

      // Check if receiving school is valid
      const isToSchool = await school.findById(toSchool)

      if (!isToSchool) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'Receiving school not found.'
        })
      }

      // Check if receiving classroom belongs to the receiving school
      if (!isToSchool.classrooms.includes(toClassroom)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'The provided classroom is not associated with this school.'
        })
      }

      const receivingClassroom = await classroom.findById(toClassroom)

      if (!receivingClassroom) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'The provided classroom is not associated with this school.'
        })
      }

      // Verify that receiving classroom has not exceeded its capacity
      if (receivingClassroom.students.length === receivingClassroom.capacity) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'The provided classroom has reached its maximum capacity.'
        })
      }

      // Check if the student exists
      const isStudent = await student.findById(studentId)

      if (!isStudent) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'Student not found.'
        })
      }

      // Verify if the school administrator is valid for the current school
      const isSchool = await school.findById(isStudent.school._id)

      if (!isSchool) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'School not found.'
        })
      }

      if (!isSchool.administrators.includes(adminId)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors:
            'The provided administrator is not associated with this school.'
        })
      }

      // Verify if the current classroom is valid
      const isClassroom = await classroom.findById(isStudent.classroom._id)

      if (!isClassroom) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'Classroom not found.'
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
