module.exports = class User {
  /**
   * @param {Object} options - Dependencies and configurations for User
   * @param {Object} options.bcrypt - Bcrypt library for password hashing
   * @param {Object} options.utils - Utility functions
   * @param {Object} options.managers - Manager instances, including token manager
   * @param {Object} options.userModels - MongoDB models for users
   * @param {Object} options.roleModels - MongoDB models for roles
   */
  constructor({ bcrypt, utils, managers, userModels, roleModels } = {}) {
    this.bcrypt = bcrypt
    this.utils = utils
    this.userModels = userModels
    this.roleModels = roleModels
    this.tokenManager = managers.token
    this.usersCollection = 'users'
    this.userExposed = [
      'createUser',
      'getUsers',
      'getuserById',
      'updateUserProfile',
      'deleteUserProfile'
    ]
  }

  /**
   * Create a new user
   * @param {Object} userDetails - Details of the user to be created
   * @param {string} userDetails.username - Username of the user
   * @param {string} userDetails.email - Email address of the user
   * @param {string} userDetails.password - Password of the user
   * @param {string} userDetails.role - Role ID for the user
   * @returns {Object} Result of user creation
   */
  async createUser({ username, email, password, role }) {
    const user = this.userModels.user

    const fieldsToCheck = { username, email }
    const validationError = await this.utils.validateUniqueFields(
      user,
      fieldsToCheck,
      'User'
    )
    if (validationError) {
      return validationError
    }

    const hashedPassword = await this.bcrypt.hash(password, 10)

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    const createdUser = await user.create({
      username,
      email,
      password: hashedPassword,
      role
    })

    return {
      success: true,
      message: 'User created successfully.',
      data: {
        id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role
      }
    }
  }

  /**
   * Create a superadmin user
   * @param {Object} superadminDetails - Details of the superadmin to be created
   * @param {string} superadminDetails.username - Username of the superadmin
   * @param {string} superadminDetails.email - Email address of the superadmin
   * @param {string} superadminDetails.password - Password of the superadmin
   * @returns {Object} Result of superadmin creation
   */
  async createSuperadmin({ username, email, password }) {
    const role = await this.roleModels.role
    let permission = await role.findOne({ permission: 'superadmin' })

    if (!permission) {
      permission = await role.create({ permission: 'superadmin' })
    }

    const superadmin = await this.createUser({
      username,
      email,
      password,
      role: permission._id
    })

    return superadmin
  }

  /**
   * Fetch a paginated list of users
   * @param {Object} pagination - Pagination details
   * @param {number} pagination.page - Current page number
   * @param {number} pagination.limit - Number of records per page
   * @returns {Object} Result of fetching users
   */
  async getUsers({ page = 1, limit = 10 }) {
    const skip = (page - 1) * limit

    const user = this.userModels.user

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    const isUser = await user
      .find()
      .select('-password')
      .populate('role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    if (!isUser || isUser.length === 0) {
      return { errors: 'No user found' }
    }

    const totalUsers = await user.countDocuments()

    return {
      success: true,
      message: 'Users fetched successfully.',
      data: isUser,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
      }
    }
  }

  /**
   * Fetch user details by ID
   * @param {Object} params - Parameters for fetching user
   * @param {string} params.adminId - ID of the admin requesting the data
   * @param {string} params.userId - ID of the user to fetch
   * @param {string} params.permission - Permission level of the admin
   * @returns {Object} Result of fetching user
   */
  async getuserById({ adminId, userId, permission }) {
    const user = this.userModels.user

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    const isUser = await user
      .findById(userId)
      .select('-password')
      .populate('role')

    if (!isUser) {
      return { errors: 'No user found.' }
    }

    if (adminId !== userId && permission !== 'superadmin') {
      return { errors: 'You are not authorized to perform this action.' }
    }

    return {
      success: true,
      message: 'User fetched successfully.',
      data: isUser
    }
  }

  /**
   * Update a user profile
   * @param {Object} params - Parameters for updating user profile
   * @param {string} params.adminId - ID of the admin requesting the update
   * @param {string} params.userId - ID of the user to update
   * @param {string} params.permission - Permission level of the admin
   * @param {Object} params.updates - Updates to be applied
   * @returns {Object} Result of updating user profile
   */
  async updateUserProfile({ adminId, userId, permission, updates }) {
    const user = await this.userModels.user.findById(userId)

    if (!user) {
      return { errors: 'User not found.' }
    }

    if (adminId !== userId && permission !== 'superadmin') {
      return { errors: 'You are not authorized to perform this action.' }
    }

    if (updates.schools) {
      const { add = [], remove = [] } = updates.schools

      for (const school of add) {
        if (!user.schools.includes(school)) {
          user.schools.push(adminId)
        }
      }

      user.schools = user.schools.filter(
        (school) => !remove.includes(school.toString())
      )
    }

    const updatableFields = ['username', 'email', 'password', 'role']

    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        if (field === 'password') {
          const hashedPassword = await this.bcrypt.hash(updates[field], 10)
          user[field] = hashedPassword
        } else {
          user[field] = updates[field]
        }
      }
    }

    user.updatedAt = new Date()

    await user.save()

    return {
      success: true,
      message: 'User profile updated successfully.'
    }
  }

  /**
   * Delete a user profile
   * @param {Object} params - Parameters for deleting user profile
   * @param {string} params.adminId - ID of the admin requesting the deletion
   * @param {string} params.userId - ID of the user to delete
   * @returns {Object} Result of deleting user profile
   */
  async deleteUserProfile({ adminId, userId }) {
    const user = this.userModels.user

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    if (adminId === userId) {
      return { errors: 'You are not authorized to perform this action.' }
    }

    const isUser = await user.findById(userId)

    if (!isUser) {
      return { errors: 'No user found.' }
    }

    await user.findByIdAndDelete({
      _id: userId
    })

    return {
      success: true,
      message: 'User profile deleted successfully.'
    }
  }
}
