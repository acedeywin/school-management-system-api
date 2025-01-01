const authMiddleware = require('../../mws/__token.mw')

describe('Auth Middleware', () => {
  let req, res, next, mockManagers

  beforeEach(() => {
    req = {
      headers: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    mockManagers = {
      responseDispatcher: {
        dispatch: jest.fn()
      },
      token: {
        isBlacklisted: jest.fn(),
        verifyShortToken: jest.fn()
      }
    }
  })

  it('should return 500 if responseDispatcher is not defined', async () => {
    delete mockManagers.responseDispatcher

    const middleware = authMiddleware({ managers: mockManagers })

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      code: 500,
      errors: 'Internal server errors: responseDispatcher not found'
    })
  })

  it('should return 401 if authorization header is missing', async () => {
    const middleware = authMiddleware({ managers: mockManagers })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Unauthorized',
      message: 'Authorization header missing'
    })
  })

  it('should return 401 if token is blacklisted', async () => {
    req.headers.authorization = 'Bearer blacklistedToken'
    mockManagers.token.isBlacklisted.mockResolvedValue(true)

    const middleware = authMiddleware({ managers: mockManagers })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Unauthorized',
      message: 'Session expired.'
    })
  })

  it('should return 401 if token verification fails', async () => {
    req.headers.authorization = 'Bearer invalidToken'
    mockManagers.token.isBlacklisted.mockResolvedValue(false)
    mockManagers.token.verifyShortToken.mockImplementation(() => {
      throw new Error('Invalid token')
    })

    const middleware = authMiddleware({ managers: mockManagers })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Unauthorized'
    })
  })

  it('should return 401 if decoded token is null', async () => {
    req.headers.authorization = 'Bearer invalidToken'
    mockManagers.token.isBlacklisted.mockResolvedValue(false)
    mockManagers.token.verifyShortToken.mockReturnValue(null)

    const middleware = authMiddleware({ managers: mockManagers })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Unauthorized',
      message: 'You are not authorized to perform this action.'
    })
  })

  it('should call next if the token is valid and not blacklisted', async () => {
    req.headers.authorization = 'Bearer validToken'
    const decodedToken = { userId: '123', userKey: 'admin' }
    mockManagers.token.isBlacklisted.mockResolvedValue(false)
    mockManagers.token.verifyShortToken.mockReturnValue(decodedToken)

    const middleware = authMiddleware({ managers: mockManagers })

    await middleware(req, res, next)

    expect(req.user).toEqual(decodedToken)
    expect(next).toHaveBeenCalled()
  })
})
