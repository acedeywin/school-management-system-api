const validateQueryParamsMiddleware = require('../../mws/__query.mw')

describe('Validate Query Params Middleware', () => {
  let req, res, next
  let mockManagers

  beforeEach(() => {
    req = { query: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()

    mockManagers = {
      responseDispatcher: {
        dispatch: jest.fn()
      }
    }
  })

  it('should return an error if query is not an array', () => {
    const middleware = validateQueryParamsMiddleware({
      query: 'invalid',
      managers: mockManagers
    })
    middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 400,
      errors: 'Invalid.',
      message:
        'Invalid query validation configuration. Expected an array of parameters.'
    })
  })

  it('should return an error if required query parameters are missing', () => {
    req.query = { param1: 'value1' }
    const middleware = validateQueryParamsMiddleware({
      query: ['param1', 'param2'],
      managers: mockManagers
    })
    middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 400,
      errors: 'Invalid.',
      message: 'Missing required query parameters: param2'
    })
  })

  it('should call next if all required query parameters are present', () => {
    req.query = { param1: 'value1', param2: 'value2' }
    const middleware = validateQueryParamsMiddleware({
      query: ['param1', 'param2'],
      managers: mockManagers
    })
    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should handle errors and pass them to next', () => {
    const middleware = validateQueryParamsMiddleware({
      query: ['param1'],
      managers: mockManagers
    })
    jest
      .spyOn(mockManagers.responseDispatcher, 'dispatch')
      .mockImplementation(() => {
        throw new Error('Dispatch error')
      })

    middleware(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
