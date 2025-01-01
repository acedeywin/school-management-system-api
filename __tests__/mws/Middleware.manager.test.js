const { validateRequest } = require('../../mws/Middleware.manager')
const { validateSchema } = require('../../managers/_common/schema.validators')

jest.mock('../../managers/_common/schema.validators', () => ({
  validateSchema: jest.fn()
}))

describe('validateRequest Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call next if all schema validations pass', () => {
    req.body = { key1: 'value1', key2: 'value2' }
    const schemaKeys = ['key1', 'key2']

    validateSchema.mockReturnValue({ valid: true })

    const middleware = validateRequest(schemaKeys)
    middleware(req, res, next)

    expect(validateSchema).toHaveBeenCalledTimes(2)
    expect(validateSchema).toHaveBeenCalledWith(req.body, 'key1')
    expect(validateSchema).toHaveBeenCalledWith(req.body, 'key2')
    expect(next).toHaveBeenCalled()
  })

  it('should return 400 if schema validation fails for any key', () => {
    req.body = { key1: 'value1', key2: 'value2' }
    const schemaKeys = ['key1', 'key2']

    validateSchema.mockImplementation((_, key) => {
      if (key === 'key2') {
        return { valid: false, error: 'Validation error for key2' }
      }
      return { valid: true }
    })

    const middleware = validateRequest(schemaKeys)
    middleware(req, res, next)

    expect(validateSchema).toHaveBeenCalledTimes(2)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      errors: 'Validation error for key2'
    })
    expect(next).not.toHaveBeenCalled() // Verifies next is NOT called
  })

  it('should skip validation for keys not present in the request body', () => {
    req.body = { key1: 'value1' } // `key2` is not present
    const schemaKeys = ['key1', 'key2']

    validateSchema.mockReturnValue({ valid: true })

    const middleware = validateRequest(schemaKeys)
    middleware(req, res, next)

    expect(validateSchema).toHaveBeenCalledTimes(1)
    expect(validateSchema).toHaveBeenCalledWith(req.body, 'key1')
    expect(next).toHaveBeenCalled()
  })

  it('should return 500 if an unexpected error occurs', () => {
    req.body = { key1: 'value1' }
    const schemaKeys = ['key1']

    validateSchema.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const middleware = validateRequest(schemaKeys)
    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ errors: 'Unexpected error' })
    expect(next).not.toHaveBeenCalled()
  })
})
