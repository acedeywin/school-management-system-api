const Auth = require('../../../../managers/entities/auth/Auth.manager')

describe('Auth Class', () => {
  let auth
  let mockUtils
  let mockConfig
  let mockManagers
  let mockUserModels
  let mockRoleModels

  beforeEach(() => {
    mockUtils = {
      bcrypt: {
        compare: jest.fn()
      },
      jwt: {
        decode: jest.fn()
      }
    }

    mockConfig = {}

    mockManagers = {
      token: {
        genLongToken: jest.fn(),
        v1_createShortToken: jest.fn(),
        isBlacklisted: jest.fn(),
        addToBlacklist: jest.fn()
      }
    }

    mockUserModels = {
      user: {
        findOne: jest.fn()
      }
    }

    mockRoleModels = {
      role: {
        findOne: jest.fn()
      }
    }

    auth = new Auth({
      utils: mockUtils,
      config: mockConfig,
      managers: mockManagers,
      userModels: mockUserModels,
      roleModels: mockRoleModels
    })
  })

  describe('login', () => {
    it('should return error if user model is not loaded', async () => {
      auth.userModels.user = null

      const result = await auth.login({
        identifier: 'test@example.com',
        password: 'password',
        deviceInfo: {}
      })

      expect(result).toEqual({ errors: 'User model is not loaded' })
    })

    it('should return error if user is not found', async () => {
      mockUserModels.user.findOne.mockResolvedValue(null)

      const result = await auth.login({
        identifier: 'test@example.com',
        password: 'password',
        deviceInfo: {}
      })

      expect(result).toEqual({ errors: 'Invalid email or password.' })
    })

    it('should return error if passwords do not match', async () => {
      mockUserModels.user.findOne.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword'
      })
      mockUtils.bcrypt.compare.mockResolvedValue(false)

      const result = await auth.login({
        identifier: 'test@example.com',
        password: 'wrongPassword',
        deviceInfo: {}
      })

      expect(result).toEqual({ errors: 'Invalid email or password.' })
    })

    it('should return success and tokens if login is successful', async () => {
      mockUserModels.user.findOne.mockResolvedValue({
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        role: 'roleId',
        password: 'hashedPassword'
      })
      mockUtils.bcrypt.compare.mockResolvedValue(true)
      mockRoleModels.role.findOne.mockResolvedValue({ permission: 'admin' })
      mockManagers.token.genLongToken.mockReturnValue('longToken')
      mockManagers.token.v1_createShortToken.mockReturnValue('shortToken')

      const result = await auth.login({
        identifier: 'test@example.com',
        password: 'password',
        deviceInfo: {}
      })

      expect(result).toEqual({
        success: true,
        message: 'Logged in successfully.',
        data: {
          id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin'
        },
        token: 'shortToken'
      })
    })
  })

  describe('logout', () => {
    it('should return error if token is invalid', async () => {
      mockUtils.jwt.decode.mockReturnValue(null)

      const result = await auth.logout({ token: 'invalidToken' })

      expect(result).toEqual({ errors: 'Invalid token' })
    })

    it('should return error if token is already blacklisted', async () => {
      mockUtils.jwt.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600
      })
      mockManagers.token.isBlacklisted.mockResolvedValue(true)

      const result = await auth.logout({ token: 'validToken' })

      expect(result).toEqual({ errors: 'You are already logged out' })
    })

    it('should return success if logout is successful', async () => {
      mockUtils.jwt.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600
      })
      mockManagers.token.isBlacklisted.mockResolvedValue(false)

      const result = await auth.logout({ token: 'validToken' })

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully.'
      })
      expect(mockManagers.token.addToBlacklist).toHaveBeenCalledWith(
        'validToken',
        3600
      )
    })
  })
})
