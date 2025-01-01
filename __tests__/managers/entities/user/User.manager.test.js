const User = require('../../../../managers/entities/user/User.manager')

describe('User Class', () => {
  let user
  let mockBcrypt
  let mockUtils
  let mockManagers
  let mockUserModels
  let mockRoleModels

  beforeEach(() => {
    mockBcrypt = {
      hash: jest.fn()
    }

    mockUtils = {
      validateUniqueFields: jest.fn()
    }

    mockManagers = {
      token: {}
    }

    const defaultUserMocks = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([])
              })
            })
          })
        })
      }),
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      }),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(0)
    }

    // Assign default mocks
    mockUserModels = {
      user: { ...defaultUserMocks }
    }

    mockUserModels.user.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  _id: 'userId1',
                  username: 'user1',
                  email: 'user1@example.com',
                  role: 'roleId1'
                }
              ])
            })
          })
        })
      })
    })
    mockUserModels.user.countDocuments.mockResolvedValue(10)

    // Mock for findById
    mockUserModels.user.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'userId1',
          username: 'user1',
          email: 'user1@example.com',
          role: 'roleId1'
        })
      })
    })

    mockRoleModels = {
      role: {
        findOne: jest.fn(),
        create: jest.fn()
      }
    }

    user = new User({
      bcrypt: mockBcrypt,
      utils: mockUtils,
      managers: mockManagers,
      userModels: mockUserModels,
      roleModels: mockRoleModels
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should return validation error if fields are not unique', async () => {
      mockUtils.validateUniqueFields.mockResolvedValue({
        errors: 'Validation error'
      })

      const result = await user.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'roleId'
      })

      expect(result).toEqual({ errors: 'Validation error' })
    })

    it('should return error if user model is not loaded', async () => {
      user.userModels.user = null

      const result = await user.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'roleId'
      })

      expect(result).toEqual({ errors: 'User model is not loaded' })
    })

    it('should return success if user is created', async () => {
      mockUserModels.user.create.mockResolvedValue({
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        role: 'roleId'
      })

      const result = await user.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'roleId'
      })

      expect(result).toEqual({
        success: true,
        message: 'User created successfully.',
        data: {
          id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
          role: 'roleId'
        }
      })
    })
  })

  describe('createSuperadmin', () => {
    it('should create a superadmin role if it does not exist', async () => {
      mockRoleModels.role.findOne.mockResolvedValue(null)
      mockRoleModels.role.create.mockResolvedValue({
        _id: 'roleId',
        permission: 'superadmin'
      })
      mockUtils.validateUniqueFields.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashedPassword')
      mockUserModels.user.create.mockResolvedValue({
        _id: 'superadminId',
        username: 'superadmin',
        email: 'superadmin@example.com',
        role: 'roleId'
      })

      const result = await user.createSuperadmin({
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: 'password'
      })

      expect(result).toEqual({
        success: true,
        message: 'User created successfully.',
        data: {
          id: 'superadminId',
          username: 'superadmin',
          email: 'superadmin@example.com',
          role: 'roleId'
        }
      })
    })
  })

  describe('getUsers', () => {
    it('should return error if user model is not loaded', async () => {
      user.userModels.user = null

      const result = await user.getUsers({ page: 1, limit: 10 })

      expect(result).toEqual({ errors: 'User model is not loaded' })
    })

    it('should return error if no users are found', async () => {
      mockUserModels.user.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]) // Simulate no users
              })
            })
          })
        })
      })

      const result = await user.getUsers({ page: 1, limit: 10 })

      expect(result).toEqual({ errors: 'No user found' })
    })

    it('should return paginated users if found', async () => {
      const result = await user.getUsers({ page: 1, limit: 10 })

      expect(result).toEqual({
        success: true,
        message: 'Users fetched successfully.',
        data: [
          {
            _id: 'userId1',
            username: 'user1',
            email: 'user1@example.com',
            role: 'roleId1'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 10
        }
      })
    })
  })

  describe('getuserById', () => {
    it('should return error if user model is not loaded', async () => {
      user.userModels.user = null

      const result = await user.getuserById({
        adminId: 'adminId',
        userId: 'userId',
        permission: 'admin'
      })

      expect(result).toEqual({ errors: 'User model is not loaded' })
    })

    it('should return error if user is not found', async () => {
      mockUserModels.user.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null) // Simulate no user found
        })
      })

      const result = await user.getuserById({
        adminId: 'adminId',
        userId: 'userId',
        permission: 'admin'
      })

      expect(result).toEqual({ errors: 'No user found.' })
    })

    it('should return error if admin is not authorized', async () => {
      mockUserModels.user.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            _id: 'userId',
            username: 'user1',
            email: 'user1@example.com',
            role: 'roleId'
          })
        })
      })

      const result = await user.getuserById({
        adminId: 'anotherAdminId',
        userId: 'userId',
        permission: 'admin'
      })

      expect(result).toEqual({
        errors: 'You are not authorized to perform this action.'
      })
    })

    it('should return user if found and authorized', async () => {
      const result = await user.getuserById({
        adminId: 'userId1',
        userId: 'userId1',
        permission: 'admin'
      })

      expect(result).toEqual({
        success: true,
        message: 'User fetched successfully.',
        data: {
          _id: 'userId1',
          username: 'user1',
          email: 'user1@example.com',
          role: 'roleId1'
        }
      })
    })
  })

  describe('updateUserProfile', () => {
    it('should return error if user is not found', async () => {
      mockUserModels.user.findById.mockResolvedValue(null)

      const result = await user.updateUserProfile({
        adminId: 'adminId',
        userId: 'userId',
        permission: 'admin',
        updates: {}
      })

      expect(result).toEqual({ errors: 'User not found.' })
    })

    it('should return error if admin is not authorized', async () => {
      mockUserModels.user.findById.mockResolvedValue({
        _id: 'userId',
        schools: []
      })

      const result = await user.updateUserProfile({
        adminId: 'otherAdminId',
        userId: 'userId',
        permission: 'admin',
        updates: {}
      })

      expect(result).toEqual({
        errors: 'You are not authorized to perform this action.'
      })
    })

    it('should update user profile if authorized', async () => {
      mockUserModels.user.findById.mockResolvedValue({
        _id: 'userId',
        schools: [],
        save: jest.fn()
      })
      mockBcrypt.hash.mockResolvedValue('hashedPassword')

      const result = await user.updateUserProfile({
        adminId: 'userId',
        userId: 'userId',
        permission: 'admin',
        updates: { username: 'newUsername', password: 'newPassword' }
      })

      expect(result).toEqual({
        success: true,
        message: 'User profile updated successfully.'
      })
    })
  })

  describe('deleteUserProfile', () => {
    it('should return error if user model is not loaded', async () => {
      user.userModels.user = null

      const result = await user.deleteUserProfile({
        adminId: 'adminId',
        userId: 'userId'
      })

      expect(result).toEqual({ errors: 'User model is not loaded' })
    })

    it('should return error if admin tries to delete themselves', async () => {
      const result = await user.deleteUserProfile({
        adminId: 'adminId',
        userId: 'adminId'
      })

      expect(result).toEqual({
        errors: 'You are not authorized to perform this action.'
      })
    })

    it('should return error if user is not found', async () => {
      mockUserModels.user.findById.mockResolvedValue(null)

      const result = await user.deleteUserProfile({
        adminId: 'adminId',
        userId: 'userId'
      })

      expect(result).toEqual({ errors: 'No user found.' })
    })

    it('should delete user profile if authorized', async () => {
      mockUserModels.user.findById = jest
        .fn()
        .mockResolvedValue({ _id: 'userId' })
      mockUserModels.user.findByIdAndDelete = jest
        .fn()
        .mockResolvedValue({ _id: 'userId' })

      const result = await user.deleteUserProfile({
        adminId: 'adminId',
        userId: 'userId'
      })

      expect(result).toEqual({
        success: true,
        message: 'User profile deleted successfully.'
      })
    })
  })
})
