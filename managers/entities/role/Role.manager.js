module.exports = class Role {
  constructor({ mongoModels } = {}) {
    this.mongoModels = mongoModels
    this.rolesCollection = 'roles'
    this.rolesExposed = ['createRole', 'getRoles', 'getRoleById']
  }

  async createRole({ permission }) {
    const role = this.mongoModels.role

    if (!role) {
      return { error: 'Role model is not loaded' }
    }

    const newRole = await role.create({ permission })

    return {
      success: true,
      message: `${permission} role created successfully`,
      role: newRole
    }
  }

  async getRoles() {
    const roles = await this.mongoModels.role.find()

    if (!roles) {
      return { error: 'Role not found' }
    }

    return {
      success: true,
      roles
    }
  }

  async getRoleById({ roleId }) {
    const role = await this.mongoModels.role.findById(roleId)
    if (!role) {
      return { error: 'Role not found' }
    }

    return {
      success: true,
      role
    }
  }
}
