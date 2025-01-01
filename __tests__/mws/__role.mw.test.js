const validatePermissionsMiddleware = require('../../mws/__role.mw')

describe('Validate Permissions Middleware', () => {
  let req, res, next
  const mockManagers = {
    responseDispatcher: {
      dispatch: jest.fn()
    }
  }

  beforeEach(() => {
    req = { user: { userKey: 'admin' } }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  it('should call next if the user has the required permission', () => {
    const middleware = validatePermissionsMiddleware({
      managers: mockManagers,
      permission: ['admin', 'superadmin']
    })
    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should return an error if the user does not have the required permission', () => {
    req.user.userKey = 'user'

    const middleware = validatePermissionsMiddleware({
      managers: mockManagers,
      permission: ['admin', 'superadmin']
    })
    middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Unauthorized.',
      message: 'You are not authorized to perform this action.'
    })
  })
})
