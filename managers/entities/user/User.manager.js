const bcrypt = require('bcrypt')

module.exports = class User {
  constructor({ utils, managers, userModels, roleModels } = {}) {
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

  async createUser({ username, email, password, role }) {
    const user = this.userModels.user

    // // Check if the user already exists
    const fieldsToCheck = { username, email }
    const validationError = await this.utils.validateUniqueFields(
      user,
      fieldsToCheck,
      'User'
    )
    if (validationError) {
      return validationError
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    // // Create the user in MongoDB
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

    // Check if no users found
    if (!isUser || isUser.length === 0) {
      return { errors: 'No user found' }
    }

    // Count the total number of users for pagination metadata
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

  async getuserById({ adminId, userId, permission }) {
    const user = this.userModels.user

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    // Fetch the user, excluding sensitive data
    const isUser = await user
      .findById(userId)
      .select('-password')
      .populate('role')
      .populate('school')

    // Check if no users found
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

  async updateUserProfile({ adminId, userId, permission, updates }) {
    const user = this.userModels.user.findById(userId)

    if (!user) {
      return { errors: 'User not found.' }
    }

    if (adminId !== userId && permission !== 'superadmin') {
      return { errors: 'You are not authorized to perform this action.' }
    }

    // Handle schools updates
    if (updates.schools) {
      const { add = [], remove = [] } = updates.schools

      // Add schools, ensuring no duplicates
      for (const school of add) {
        if (!user.schools.includes(school)) {
          user.schools.push(adminId)
        }
      }

      // Remove schools
      user.schools = user.schools.filter(
        (school) => !remove.includes(school.toString())
      )
    }

    // Update other fields
    const updatableFields = ['username', 'email', 'password', 'role']

    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        if (field === 'password') {
          // Hash the password before updating
          const hashedPassword = await bcrypt.hash(updates[field], 10)
          user[field] = hashedPassword
        } else {
          user[field] = updates[field]
        }
      }
    }

    user.updatedAt = new Date()

    const updatedUser = await user.save()

    return {
      success: true,
      message: 'User profile updated successfully.',
      data: updatedUser
    }
  }

  async deleteUserProfile({ adminId, userId }) {
    const user = this.userModels.user

    if (!user) {
      return { errors: 'User model is not loaded' }
    }

    if (adminId === userId) {
      return { errors: 'You are not authorized to perform this action.' }
    }

    // Fetch the user
    const isUser = await user.findById(userId)

    // Check if no user found
    if (!isUser) {
      return { errors: 'No user found.' }
    }

    // / Delete the User profile
    await user.findByIdAndDelete({
      _id: userId
    })

    return {
      success: true,
      message: 'User profile deleted successfully.'
    }
  }
}
