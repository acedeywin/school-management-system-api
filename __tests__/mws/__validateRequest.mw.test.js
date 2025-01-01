const validateRequest = require('../../mws/__validateRequest.mw')

jest.mock('../../managers/_common/schema.validators', () => ({
  validateSchema: jest.fn()
}))

describe('validateRequest Middleware', () => {
  let req, res, next, mockManagers

  beforeEach(() => {
    req = {
      body: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    mockManagers = {
      validateSchema: jest.fn(),
      responseDispatcher: {
        dispatch: jest.fn()
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call next if all schema validations pass', () => {
    req.body = { key1: 'value1', key2: 'value2' }
    const schemaKeys = ['key1', 'key2']

    mockManagers.validateSchema.mockReturnValue({ valid: true })

    const middleware = validateRequest({ managers: mockManagers, schemaKeys })
    middleware(req, res, next)

    expect(mockManagers.validateSchema).toHaveBeenCalledTimes(2)
    expect(mockManagers.validateSchema).toHaveBeenCalledWith(req.body, 'key1')
    expect(mockManagers.validateSchema).toHaveBeenCalledWith(req.body, 'key2')
    expect(next).toHaveBeenCalled()
  })

  it('should return 401 if schema validation fails for any key', () => {
    req.body = { key1: 'value1', key2: 'value2' }
    const schemaKeys = ['key1', 'key2']

    mockManagers.validateSchema.mockImplementation((_, key) => {
      if (key === 'key2') {
        return { valid: false, error: 'Validation error for key2' }
      }
      return { valid: true }
    })

    const middleware = validateRequest({ managers: mockManagers, schemaKeys })
    middleware(req, res, next)

    expect(mockManagers.validateSchema).toHaveBeenCalledTimes(2)
    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Validation error for key2'
    })
    expect(next).not.toHaveBeenCalled() // Verifies next is NOT called
  })

  it('should skip validation for keys not present in the request body', () => {
    req.body = { key1: 'value1' } // `key2` is not present
    const schemaKeys = ['key1', 'key2']

    mockManagers.validateSchema.mockReturnValue({ valid: true })

    const middleware = validateRequest({ managers: mockManagers, schemaKeys })
    middleware(req, res, next)

    expect(mockManagers.validateSchema).toHaveBeenCalledTimes(1)
    expect(mockManagers.validateSchema).toHaveBeenCalledWith(req.body, 'key1')
    expect(next).toHaveBeenCalled()
  })

  it('should handle errors and return 401 if an unexpected error occurs', () => {
    req.body = { key1: 'value1' }
    const schemaKeys = ['key1']

    mockManagers.validateSchema.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const middleware = validateRequest({ managers: mockManagers, schemaKeys })
    middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: 'Unexpected error'
    })
    expect(next).not.toHaveBeenCalled()
  })
})
