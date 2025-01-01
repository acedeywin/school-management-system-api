const Role = require('../../../../managers/entities/role/Role.manager')

describe('Role Class', () => {
  let role
  let mockMongoModels

  beforeEach(() => {
    mockMongoModels = {
      role: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn()
      }
    }

    role = new Role({ mongoModels: mockMongoModels })
  })

  describe('createRole', () => {
    it('should return error if role model is not loaded', async () => {
      role.mongoModels.role = null

      const result = await role.createRole({ permission: 'admin' })

      expect(result).toEqual({ errors: 'Role model is not loaded' })
    })

    it('should create a role successfully', async () => {
      mockMongoModels.role.create.mockResolvedValue({
        _id: 'roleId',
        permission: 'admin'
      })

      const result = await role.createRole({ permission: 'admin' })

      expect(result).toEqual({
        success: true,
        message: 'admin role created successfully',
        data: {
          _id: 'roleId',
          permission: 'admin'
        }
      })
    })
  })

  describe('getRoles', () => {
    it('should return error if no roles are found', async () => {
      mockMongoModels.role.find.mockResolvedValue(null)

      const result = await role.getRoles()

      expect(result).toEqual({ errors: 'Role not found' })
    })

    it('should fetch all roles successfully', async () => {
      mockMongoModels.role.find.mockResolvedValue([
        { _id: 'roleId1', permission: 'admin' },
        { _id: 'roleId2', permission: 'user' }
      ])

      const result = await role.getRoles()

      expect(result).toEqual({
        success: true,
        message: 'Roles fetched successfully',
        data: [
          { _id: 'roleId1', permission: 'admin' },
          { _id: 'roleId2', permission: 'user' }
        ]
      })
    })
  })

  describe('getRoleById', () => {
    it('should return error if role is not found', async () => {
      mockMongoModels.role.findById.mockResolvedValue(null)

      const result = await role.getRoleById({ roleId: 'nonExistentRoleId' })

      expect(result).toEqual({ errors: 'Role not found' })
    })

    it('should fetch a role by ID successfully', async () => {
      mockMongoModels.role.findById.mockResolvedValue({
        _id: 'roleId1',
        permission: 'admin'
      })

      const result = await role.getRoleById({ roleId: 'roleId1' })

      expect(result).toEqual({
        success: true,
        message: 'Role fetched successfully',
        data: {
          _id: 'roleId1',
          permission: 'admin'
        }
      })
    })
  })
})
