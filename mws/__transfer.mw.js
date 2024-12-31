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

      console.log('isToSchool is here', isToSchool)

      if (!isToSchool) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'Receiving school not found.'
        })
      }

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

      // Verify that receiving hs not excceed it capacity
      if (receivingClassroom.students.length === receivingClassroom.capacity) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'The provided classroom has reached its maximum capacity.'
        })
      }

      // check if student is valid
      const isStudent = await student.findById(studentId)

      if (!isStudent) {
        return { errors: 'Student not found.' }
      }

      // Verify if the school administrator is valid
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

      // verify that classroom is valid
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
