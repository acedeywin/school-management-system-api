module.exports = class Student {
  constructor({ utils, studentModels, schoolModels, classroomModels }) {
    this.utils = utils
    this.studentModels = studentModels
    this.schoolModels = schoolModels
    this.classroomModels = classroomModels

    this.studentsCollection = 'students'
    this.studentExposed = [
      'enrollStudent',
      'transferStudent',
      'getStudents',
      'getStudentById',
      'updateStudent',
      'deleteStudent'
    ]
  }

  async enrollStudent({
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    schoolId,
    classroomId
  }) {
    const classroom = this.classroomModels.classroom
    const student = this.studentModels.student

    const newStudent = await student.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      classroom: classroomId,
      school: schoolId
    })

    const isClassroom = await classroom.findById(classroomId)

    // Add the student to classroom
    isClassroom.students.push(newStudent._id)
    await isClassroom.save()

    return {
      success: true,
      message: 'Student enrolled successfully.',
      data: newStudent
    }
  }

  async transferStudent({ toSchool, toClassroom, transferDate, studentId }) {
    const student = await this.studentModels.student.findById(studentId)

    student.transferHistory.push({
      fromSchool: student.school,
      toSchool,
      transferDate: transferDate || new Date()
    })

    student.school = toSchool
    student.classroom = toClassroom
    student.updatedAt = new Date()
    const transferedStudent = await student.save()

    return {
      success: true,
      message: 'Student was transfered successfully.',
      data: transferedStudent
    }
  }

  async getStudents({ adminId, schoolId, page = 1, limit = 10 }) {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit

    const student = this.studentModels.student
    const school = this.schoolModels.school

    // Verify if the school administrator is valid
    const isSchool = await school.findById(schoolId)
    if (!isSchool.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    const students = await student
      .find({ school: schoolId })
      .populate('classroom')
      .skip(skip)
      .limit(limit)

    const totalStudents = await student.countDocuments({
      school: schoolId
    })

    if (!students || students.length === 0) {
      return { errors: 'No students found for the given admin ID' }
    }

    return {
      success: true,
      message: 'Students fetched successfully.',
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents
      }
    }
  }

  async getStudentById({ studentId, adminId }) {
    const student = this.studentModels.student

    const isStudent = await student
      .findById(studentId)
      .populate('school')
      .populate('classroom')
      .populate('transferHistory')

    if (!isStudent) {
      return { errors: 'Student not found' }
    }

    const schoolId = isStudent.school._id

    // Verify if the school administrator is valid
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    return {
      success: true,
      message: 'Students fetched successfully.',
      data: isStudent
    }
  }

  async updateStudent({ studentId, updates, adminId }) {
    const student = await this.studentModels.student
      .findById(studentId)
      .populate('school')

    if (!student) {
      return { errors: 'Student not found' }
    }

    const schoolId = student.school._id

    // Verify if the school administrator is valid
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    // Update fields
    Object.assign(student, updates)
    student.updatedAt = new Date()
    await student.save()

    return {
      success: true,
      message: 'Student fetched successfully.',
      data: student
    }
  }

  async deleteStudent({ studentId, adminId }) {
    const student = this.studentModels.student
    const classroom = this.classroomModels.classroom

    const isStudent = await student
      .findById(studentId)
      .populate('school')
      .populate('classroom')

    if (!isStudent) {
      return { errors: 'Student not found.' }
    }

    const schoolId = isStudent.school._id

    // Verify if the school administrator is valid
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    const isClassroom = await classroom.findById(isStudent.classroom._id)

    // Remove the specific student from the classroom's array
    isClassroom.students = isClassroom.students.filter(
      (id) => id.toString() !== studentId.toString()
    )

    await isClassroom.save()

    await student.findByIdAndDelete({
      _id: studentId
    })

    return {
      success: true,
      message: 'Student deleted successfully.'
    }
  }
}
