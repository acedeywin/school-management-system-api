/**
 * @file Role.manager.js
 * @description Handles role management including creation, retrieval of roles, and fetching roles by ID.
 */

module.exports = class Role {
  /**
   * @constructor
   * @param {Object} options - Dependencies for the Role class
   * @param {Object} options.mongoModels - MongoDB models for roles
   */
  constructor({ mongoModels } = {}) {
    this.mongoModels = mongoModels
    this.rolesCollection = 'roles'
    this.rolesExposed = ['createRole', 'getRoles', 'getRoleById']
  }

  /**
   * Create a new role
   * @param {Object} roleDetails - Details of the role to be created
   * @param {string} roleDetails.permission - Permission name for the new role
   * @returns {Object} Result of role creation
   */
  async createRole({ permission }) {
    const role = this.mongoModels.role

    if (!role) {
      return { errors: 'Role model is not loaded' }
    }

    const newRole = await role.create({ permission })

    return {
      success: true,
      message: `${permission} role created successfully`,
      data: newRole
    }
  }

  /**
   * Retrieve all roles
   * @returns {Object} Result containing all roles
   */
  async getRoles() {
    const roles = await this.mongoModels.role.find()

    if (!roles) {
      return { errors: 'Role not found' }
    }

    return {
      success: true,
      message: 'Roles fetched successfully',
      data: roles
    }
  }

  /**
   * Retrieve a role by ID
   * @param {Object} params - Parameters for retrieving a role
   * @param {string} params.roleId - ID of the role to retrieve
   * @returns {Object} Result of fetching role by ID
   */
  async getRoleById({ roleId }) {
    const role = await this.mongoModels.role.findById(roleId)
    if (!role) {
      return { errors: 'Role not found' }
    }

    return {
      success: true,
      message: 'Role fetched successfully',
      data: role
    }
  }
}
