module.exports = class Classroom {
  constructor({ utils, schoolModels, classroomModels }) {
    this.utils = utils
    this.schoolModels = schoolModels
    this.classroomModels = classroomModels
    this.classroomsCollection = 'classrooms'
    this.classroomExposed = [
      'createClassroom',
      'getClassrooms',
      'getClassroomById',
      'updateClassroom',
      'deleteClassroom'
    ]
  }

  // Create a new classroom
  async createClassroom({ name, schoolId, capacity, resources, adminId }) {
    const classroom = this.classroomModels.classroom
    const school = this.schoolModels.school

    if (!classroom || !school) {
      return { errors: 'Classroom or School model is not loaded' }
    }

    // Verify if the school administrator is valid
    const isSchool = await school.findById(schoolId)
    if (!isSchool.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    // Check if the classroom name already exists
    const fieldsToCheck = { name }
    const validationError = await this.utils.validateUniqueFields(
      classroom,
      fieldsToCheck,
      'Classroom'
    )
    if (validationError) {
      return validationError
    }

    // Create the classroom
    const newClassroom = await classroom.create({
      name,
      school: schoolId,
      managedBy: adminId,
      capacity,
      resources
    })

    // Add the classroom to the school
    isSchool.classrooms.push(newClassroom._id)
    await isSchool.save()

    return {
      success: true,
      message: 'Classroom created successfully.',
      data: newClassroom
    }
  }

  async getClassrooms({ adminId, schoolId, page = 1, limit = 10 }) {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit

    const classroom = this.classroomModels.classroom
    const school = this.schoolModels.school

    if (!classroom || !school) {
      return { errors: 'Classroom or School model is not loaded' }
    }

    // Verify if the school administrator is valid
    const isSchool = await school.findById(schoolId)
    if (!isSchool.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    const classrooms = await classroom
      .find({ school: schoolId })
      .populate({
        path: 'managedBy',
        select: '-password'
      })
      .populate('students')
      .skip(skip)
      .limit(limit)

    // Count the total number of matching schools for pagination metadata
    const totalClassrooms = await classroom.countDocuments({
      school: schoolId
    })

    if (!classrooms || classrooms.length === 0) {
      return { errors: 'No classroom found for the given admin ID' }
    }

    return {
      success: true,
      message: 'Classrooms fetched successfully.',
      data: classrooms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalClassrooms / limit),
        totalClassrooms
      }
    }
  }

  async getClassroomById({ classroomId, adminId }) {
    const classroom = this.classroomModels.classroom

    const isClassroom = await classroom
      .findById(classroomId)
      .populate('school')
      .populate({
        path: 'managedBy',
        select: '-password'
      })
      .populate('students')

    if (!isClassroom) {
      return { errors: 'Classroom not found' }
    }

    const schoolId = isClassroom.school._id

    // Verify if the school administrator is valid
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    return {
      success: true,
      message: 'Classroom fetched successfully.',
      data: isClassroom
    }
  }

  async updateClassroom({ classroomId, updates, adminId }) {
    const classroom = await this.classroomModels.classroom
      .findById(classroomId)
      .populate('school')

    if (!classroom) {
      return { errors: 'Classroom not found.' }
    }

    const schoolId = classroom.school._id

    // Verify if the school administrator is valid
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    // Handle student update
    if (updates.students) {
      const { add = [], remove = [] } = updates.students

      // Add students, ensuring no duplicates
      for (const studentId of add) {
        if (!classroom.students.includes(studentId)) {
          classroom.students.push(studentId)
        }
      }

      //Remove students
      classroom.students = classroom.students.filter(
        (studentId) => !remove.includes(studentId.toString())
      )
    }

    // Handle resource update
    if (updates.resources) {
      const { add = [], remove = [] } = updates.resources

      // Add resources, ensuring no duplicates
      for (const resource of add) {
        if (!classroom.resources.includes(resource)) {
          classroom.resources.push(resource)
        }
      }

      //Remove resources
      classroom.resources = classroom.resources.filter(
        (resource) => !remove.includes(resource.toString())
      )
    }

    // Update other fields
    const updatableFields = ['name', 'capacity']

    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        classroom[field] = updates[field]
      }
    }

    // Update the updatedAt field
    classroom.updatedAt = new Date()

    // Save the updated classroom document
    const updatedClassroom = await classroom.save()

    return {
      success: true,
      message: 'Classroom updated successfully.',
      data: updatedClassroom
    }
  }

  async deleteClassroom({ classroomId, adminId }) {
    const classroom = this.classroomModels.classroom

    const isClassroom = await classroom.findById(classroomId).populate('school')

    if (!isClassroom) {
      return { errors: 'Classroom not found.' }
    }

    const schoolId = isClassroom.school._id
    // req.user.schoolId = schoolId

    // Verify if the school administrator is valid
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    // Delete the classroom
    await classroom.findByIdAndDelete({
      _id: classroomId
    })

    // Remove the specific classroom from the school's classrooms array
    school.classrooms = school.classrooms.filter(
      (id) => id.toString() !== classroomId.toString()
    )

    await school.save()

    return {
      success: true,
      message: 'Classroom deleted successfully.'
    }
  }
}
