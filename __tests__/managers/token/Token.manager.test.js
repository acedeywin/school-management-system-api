const jwt = require('jsonwebtoken')
const md5 = require('md5')
const TokenManager = require('../../../managers/token/Token.manager')

describe('TokenManager Class', () => {
  let tokenManager
  let mockConfig
  let mockCache

  beforeEach(() => {
    mockConfig = {
      dotEnv: {
        LONG_TOKEN_SECRET: 'long_token_secret',
        SHORT_TOKEN_SECRET: 'short_token_secret'
      }
    }

    mockCache = {
      key: {
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn()
      }
    }

    tokenManager = new TokenManager({ config: mockConfig, cache: mockCache })
  })

  // 1. Test genLongToken
  describe('genLongToken', () => {
    it('should generate a valid long token', () => {
      const userId = 'user123'
      const userKey = 'key123'

      const token = tokenManager.genLongToken({ userId, userKey })

      const decoded = jwt.verify(token, mockConfig.dotEnv.LONG_TOKEN_SECRET)
      expect(decoded).toMatchObject({ userId, userKey })
    })
  })

  // 2. Test genShortToken
  describe('genShortToken', () => {
    it('should generate a valid short token', () => {
      const userId = 'user123'
      const userKey = 'key123'
      const sessionId = 'session123'
      const deviceId = 'device123'

      const token = tokenManager.genShortToken({
        userId,
        userKey,
        sessionId,
        deviceId
      })

      const decoded = jwt.verify(token, mockConfig.dotEnv.SHORT_TOKEN_SECRET)
      expect(decoded).toMatchObject({ userId, userKey, sessionId, deviceId })
    })
  })

  // 3. Test verifyLongToken
  describe('verifyLongToken', () => {
    it('should verify a valid long token', () => {
      const token = jwt.sign(
        { userId: 'user123', userKey: 'key123' },
        mockConfig.dotEnv.LONG_TOKEN_SECRET,
        {
          expiresIn: '1h'
        }
      )

      const decoded = tokenManager.verifyLongToken({ token })

      expect(decoded).toMatchObject({ userId: 'user123', userKey: 'key123' })
    })

    it('should return null for an invalid long token', () => {
      const token = 'invalid_token'

      const decoded = tokenManager.verifyLongToken({ token })

      expect(decoded).toBeNull()
    })
  })

  // 4. Test verifyShortToken
  describe('verifyShortToken', () => {
    it('should verify a valid short token', () => {
      const token = jwt.sign(
        { userId: 'user123', userKey: 'key123' },
        mockConfig.dotEnv.SHORT_TOKEN_SECRET,
        {
          expiresIn: '1h'
        }
      )

      const decoded = tokenManager.verifyShortToken({ token })

      expect(decoded).toMatchObject({ userId: 'user123', userKey: 'key123' })
    })

    it('should return null for an invalid short token', () => {
      const token = 'invalid_token'

      const decoded = tokenManager.verifyShortToken({ token })

      expect(decoded).toBeNull()
    })
  })

  // 5. Test v1_createShortToken
  describe('v1_createShortToken', () => {
    it('should generate a valid short token from a long token', () => {
      const longToken = jwt.sign(
        { userId: 'user123', userKey: 'key123' },
        mockConfig.dotEnv.LONG_TOKEN_SECRET
      )

      const shortToken = tokenManager.v1_createShortToken({
        __longToken: longToken,
        __device: 'device_string'
      })

      const decoded = jwt.verify(
        shortToken,
        mockConfig.dotEnv.SHORT_TOKEN_SECRET
      )
      expect(decoded).toMatchObject({
        userId: 'user123',
        userKey: 'key123',
        deviceId: md5('device_string')
      })
    })

    it('should return an error if the long token is missing', () => {
      const result = tokenManager.v1_createShortToken({
        __device: 'device_string'
      })

      expect(result).toEqual({ errors: 'missing token ' })
    })

    it('should return an error if the long token is invalid', () => {
      const result = tokenManager.v1_createShortToken({
        __longToken: 'invalid_token',
        __device: 'device_string'
      })

      expect(result).toEqual({ errors: 'invalid' })
    })
  })

  // 6. Test addToBlacklist
  describe('addToBlacklist', () => {
    it('should add a token to the blacklist', async () => {
      const token = jwt.sign(
        { userId: 'user123' },
        mockConfig.dotEnv.LONG_TOKEN_SECRET
      )

      await tokenManager.addToBlacklist(token)

      expect(mockCache.key.set).toHaveBeenCalledWith({
        key: `blacklist:${token}`,
        data: 'true',
        ttl: expect.any(Number)
      })
    })
  })

  // 7. Test isBlacklisted
  describe('isBlacklisted', () => {
    it('should return true if the token is blacklisted', async () => {
      const token = 'blacklisted_token'
      mockCache.key.get.mockResolvedValue('true')

      const result = await tokenManager.isBlacklisted(token)

      expect(result).toBe(true)
    })

    it('should return false if the token is not blacklisted', async () => {
      const token = 'not_blacklisted_token'
      mockCache.key.get.mockResolvedValue(null)

      const result = await tokenManager.isBlacklisted(token)

      expect(result).toBe(false)
    })
  })
})
