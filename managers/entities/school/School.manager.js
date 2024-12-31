module.exports = class School {
  /**
   * @constructor
   * @param {Object} options - Dependencies for the School class
   * @param {Object} options.utils - Utility functions
   * @param {Object} options.mongoModels - MongoDB models for schools
   */
  constructor({ utils, mongoModels } = {}) {
    this.utils = utils
    this.mongoModels = mongoModels
    this.schoolsCollection = 'schools'
    this.schoolExposed = [
      'createSchool',
      'getSchools',
      'getSchoolById',
      'updateSchool',
      'deleteSchool'
    ]
  }

  /**
   * Creates a new school
   * @param {string} name - Name of the school
   * @param {string} address - Address of the school
   * @param {string} phoneNumber - Phone number of the school
   * @param {string} email - Email address of the school
   * @param {string} website - Website URL of the school
   * @param {Array<string>} administrators - List of administrator IDs
   * @param {string} adminId - ID of the superadmin creating the school
   * @returns {Object} Result of school creation
   */
  async createSchool({
    name,
    address,
    phoneNumber,
    email,
    website,
    administrators,
    adminId
  }) {
    const school = this.mongoModels.school

    if (!school) {
      return { errors: 'School model is not loaded' }
    }

    const fieldsToCheck = { name, phoneNumber, email, website }
    const validationError = await this.utils.validateUniqueFields(
      school,
      fieldsToCheck,
      'School'
    )
    if (validationError) {
      return validationError
    }

    if (!Array.isArray(administrators)) {
      administrators = []
    }

    if (!administrators.includes(adminId)) {
      administrators.push(adminId)
    }

    await this.utils.validateAdministrators(
      administrators,
      this.mongoModels.school
    )

    const newSchool = await school.create({
      name,
      address,
      phoneNumber,
      email,
      website,
      administrators
    })

    return {
      success: true,
      message: 'School created successfully.',
      data: newSchool
    }
  }

  /**
   * Fetches a list of schools
   * @param {string} adminId - ID of the administrator to filter schools
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of records per page
   * @returns {Object} Result containing the list of schools
   */
  async getSchools({ adminId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit
    const school = this.mongoModels.school

    const schools = await school
      .find({
        administrators: { $in: [adminId] }
      })
      .populate('classrooms')
      .skip(skip)
      .limit(limit)

    const totalSchools = await school.countDocuments({
      administrators: { $in: [adminId] }
    })

    if (!schools || schools.length === 0) {
      return { errors: 'No school found for the given admin ID' }
    }

    return {
      success: true,
      message: 'Schools fetched successfully.',
      data: schools,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSchools / limit),
        totalSchools
      }
    }
  }

  /**
   * Fetches a school by its ID
   * @param {Object} params - Parameters for fetching a school
   * @param {string} params.schoolId - ID of the school to fetch
   * @param {string} params.adminId - ID of the administrator accessing the school
   * @returns {Object} Result containing the school details
   */
  async getSchoolById({ schoolId, adminId }) {
    const school = await this.mongoModels.school
      .findOne({
        _id: schoolId,
        administrators: { $in: [adminId] }
      })
      .populate('classrooms')

    if (!school) {
      return {
        errors: 'School not found or you do not have access to this school'
      }
    }

    return {
      success: true,
      message: 'School fetched successfully.',
      data: school
    }
  }

  /**
   * Updates a school
   * @param {string} schoolId - ID of the school to update
   * @param {Object} updates - Fields to update
   * @param {string} superadminId - ID of the superadmin performing the update
   * @returns {Object} Result of the update operation
   */
  async updateSchool({ schoolId, updates, superadminId }) {
    const school = await this.mongoModels.school.findById(schoolId)

    if (!school) {
      return { errors: 'School not found.' }
    }

    if (!school.administrators.includes(superadminId)) {
      return {
        errors:
          'Unauthorized. You are not an authorized administrator of this school.'
      }
    }

    if (updates.administrators) {
      const { add = [], remove = [] } = updates.administrators

      for (const adminId of add) {
        if (!school.administrators.includes(adminId)) {
          school.administrators.push(adminId)
        }
      }

      school.administrators = school.administrators.filter(
        (adminId) => !remove.includes(adminId.toString())
      )
    }

    const updatableFields = [
      'name',
      'address',
      'phoneNumber',
      'email',
      'website'
    ]
    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        school[field] = updates[field]
      }
    }

    school.updatedAt = new Date()

    const updatedSchool = await school.save()

    return {
      success: true,
      message: 'School updated successfully.',
      data: updatedSchool
    }
  }

  /**
   * Deletes a school
   * @param {string} schoolId - ID of the school to delete
   * @param {string} superadminId - ID of the superadmin performing the deletion
   * @returns {Object} Result of the delete operation
   */
  async deleteSchool({ schoolId, superadminId }) {
    const school = this.mongoModels.school

    const isSchool = await school.findById(schoolId)

    if (!isSchool) {
      return { errors: 'School not found.' }
    }

    if (!isSchool.administrators.includes(superadminId)) {
      return {
        errors:
          'Unauthorized. Only authorized administrators can delete this school.'
      }
    }

    await school.findByIdAndDelete({ _id: schoolId })

    return {
      success: true,
      message: 'School deleted successfully.'
    }
  }
}
