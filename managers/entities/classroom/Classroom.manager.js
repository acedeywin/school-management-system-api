module.exports = class Classroom {
  /**
   * @constructor
   * @param {Object} utils - Utility functions
   * @param {Object} schoolModels - Models related to schools
   * @param {Object} classroomModels - Models related to classrooms
   */
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

  /**
   * Create a new classroom
   * @param {string} name - Name of the classroom
   * @param {string} schoolId - ID of the school
   * @param {number} capacity - Maximum capacity of the classroom
   * @param {Array} resources - Resources available in the classroom
   * @param {string} adminId - ID of the administrator creating the classroom
   * @returns {Object} Result of the classroom creation
   */
  async createClassroom({ name, schoolId, capacity, resources, adminId }) {
    const classroom = this.classroomModels.classroom
    const school = this.schoolModels.school

    if (!classroom || !school) {
      return { errors: 'Classroom or School model is not loaded' }
    }

    const isSchool = await school.findById(schoolId)
    if (!isSchool.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    const fieldsToCheck = { name }
    const validationError = await this.utils.validateUniqueFields(
      classroom,
      fieldsToCheck,
      'Classroom'
    )
    if (validationError) {
      return validationError
    }

    const newClassroom = await classroom.create({
      name,
      school: schoolId,
      managedBy: adminId,
      capacity,
      resources
    })

    isSchool.classrooms.push(newClassroom._id)
    await isSchool.save()

    return {
      success: true,
      message: 'Classroom created successfully.',
      data: newClassroom
    }
  }

  /**
   * Fetch all classrooms
   * @param {string} adminId - ID of the administrator
   * @param {string} schoolId - ID of the school
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of classrooms per page
   * @returns {Object} Result containing classrooms and pagination metadata
   */
  async getClassrooms({ adminId, schoolId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit

    const classroom = this.classroomModels.classroom
    const school = this.schoolModels.school

    if (!classroom || !school) {
      return { errors: 'Classroom or School model is not loaded' }
    }

    const isSchool = await school.findById(schoolId)
    if (!isSchool.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    const classrooms = await classroom
      .find({ school: schoolId })
      .populate({ path: 'managedBy', select: '-password' })
      .populate('students')
      .skip(skip)
      .limit(limit)

    const totalClassrooms = await classroom.countDocuments({ school: schoolId })

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

  /**
   * Fetch a classroom by ID
   * @param {string} classroomId - ID of the classroom
   * @param {string} adminId - ID of the administrator
   * @returns {Object} Result containing the classroom details
   */
  async getClassroomById({ classroomId, adminId }) {
    const classroom = this.classroomModels.classroom

    const isClassroom = await classroom
      .findById(classroomId)
      .populate('school')
      .populate({ path: 'managedBy', select: '-password' })
      .populate('students')

    if (!isClassroom) {
      return { errors: 'Classroom not found' }
    }

    const schoolId = isClassroom.school._id
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

  /**
   * Update a classroom
   * @param {string} classroomId - ID of the classroom
   * @param {Object} updates - Updates to apply to the classroom
   * @param {string} adminId - ID of the administrator
   * @returns {Object} Result of the classroom update
   */
  async updateClassroom({ classroomId, updates, adminId }) {
    const classroom = await this.classroomModels.classroom
      .findById(classroomId)
      .populate('school')

    if (!classroom) {
      return { errors: 'Classroom not found.' }
    }

    const schoolId = classroom.school._id
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    if (updates.resources) {
      const { add = [], remove = [] } = updates.resources

      for (const resource of add) {
        if (!classroom.resources.includes(resource)) {
          classroom.resources.push(resource)
        }
      }

      classroom.resources = classroom.resources.filter(
        (resource) => !remove.includes(resource.toString())
      )
    }

    const updatableFields = ['name', 'capacity']
    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        classroom[field] = updates[field]
      }
    }

    classroom.updatedAt = new Date()
    const updatedClassroom = await classroom.save()

    return {
      success: true,
      message: 'Classroom updated successfully.',
      data: updatedClassroom
    }
  }

  /**
   * Delete a classroom
   * @param {string} classroomId - ID of the classroom to delete
   * @param {string} adminId - ID of the administrator
   * @returns {Object} Result of the classroom deletion
   */
  async deleteClassroom({ classroomId, adminId }) {
    const classroom = this.classroomModels.classroom

    const isClassroom = await classroom.findById(classroomId).populate('school')
    if (!isClassroom) {
      return { errors: 'Classroom not found.' }
    }

    const schoolId = isClassroom.school._id
    const school = await this.schoolModels.school.findById(schoolId)

    if (!school.administrators.includes(adminId)) {
      return {
        errors: 'The provided administrator is not associated with this school'
      }
    }

    await classroom.findByIdAndDelete({ _id: classroomId })

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
