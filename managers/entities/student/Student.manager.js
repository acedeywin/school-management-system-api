module.exports = class Student {
  /**
   * @constructor
   * @param {Object} utils - Utility functions.
   * @param {Object} studentModels - MongoDB models for students.
   * @param {Object} schoolModels - MongoDB models for schools.
   * @param {Object} classroomModels - MongoDB models for classrooms.
   */
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

  /**
   * Enrolls a new student into a school and classroom.
   * @param {string} firstName - First name of the student.
   * @param {string} lastName - Last name of the student.
   * @param {string} email - Email address of the student.
   * @param {string} phoneNumber - Phone number of the student.
   * @param {Date} dateOfBirth - Date of birth of the student.
   * @param {string} schoolId - ID of the school.
   * @param {string} classroomId - ID of the classroom.
   * @returns {Object} Result of the enrollment operation.
   */
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

    // Add the student to the classroom
    isClassroom.students.push(newStudent._id)
    await isClassroom.save()

    return {
      success: true,
      message: 'Student enrolled successfully.',
      data: newStudent
    }
  }

  /**
   * Transfers a student to a new school and/or classroom.
   * @param {string} toSchool - ID of the new school.
   * @param {string} toClassroom - ID of the new classroom.
   * @param {Date} transferDate - Date of the transfer.
   * @param {string} studentId - ID of the student being transferred.
   * @returns {Object} Result of the transfer operation.
   */
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
    const transferredStudent = await student.save()

    return {
      success: true,
      message: 'Student was transferred successfully.',
      data: transferredStudent
    }
  }

  /**
   * Retrieves a list of students in a specified school.
   * @param {string} adminId - ID of the admin requesting the data.
   * @param {string} schoolId - ID of the school.
   * @param {number} [page=1] - Page number for pagination.
   * @param {number} [limit=10] - Number of records per page.
   * @returns {Object} List of students with pagination metadata.
   */
  async getStudents({ adminId, schoolId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit

    const student = this.studentModels.student
    const school = this.schoolModels.school

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

  /**
   * Retrieves details of a specific student by ID.
   * @param {string} studentId - ID of the student.
   * @param {string} adminId - ID of the admin requesting the data.
   * @returns {Object} Details of the requested student.
   */
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

    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    return {
      success: true,
      message: 'Student fetched successfully.',
      data: isStudent
    }
  }

  /**
   * Updates details of a student.
   * @param {string} studentId - ID of the student to update.
   * @param {Object} updates - Fields to update.
   * @param {string} adminId - ID of the admin requesting the update.
   * @returns {Object} Updated student details.
   */
  async updateStudent({ studentId, updates, adminId }) {
    const student = await this.studentModels.student
      .findById(studentId)
      .populate('school')

    if (!student) {
      return { errors: 'Student not found' }
    }

    const schoolId = student.school._id

    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    Object.assign(student, updates)
    student.updatedAt = new Date()
    await student.save()

    return {
      success: true,
      message: 'Student updated successfully.',
      data: student
    }
  }

  /**
   * Deletes a student by ID.
   * @param {string} studentId - ID of the student to delete.
   * @param {string} adminId - ID of the admin requesting the deletion.
   * @returns {Object} Result of the deletion operation.
   */
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

    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    const isClassroom = await classroom.findById(isStudent.classroom._id)

    isClassroom.students = isClassroom.students.filter(
      (id) => id.toString() !== studentId.toString()
    )

    await isClassroom.save()

    await student.findByIdAndDelete({ _id: studentId })

    return {
      success: true,
      message: 'Student deleted successfully.'
    }
  }
}
