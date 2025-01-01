const deviceMiddleware = require('../../mws/__device.mw')
const useragent = require('useragent')
const requestIp = require('request-ip')

describe('Device Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }
    res = {}
    next = jest.fn()

    jest.spyOn(requestIp, 'getClientIp').mockReturnValue('192.168.1.1')
    jest.spyOn(useragent, 'lookup').mockReturnValue({
      family: 'Chrome',
      major: '91',
      os: { family: 'Windows', major: '10' }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should add device information to req', () => {
    const middleware = deviceMiddleware()
    middleware(req, res, next)

    expect(req.device).toEqual({
      ip: '192.168.1.1',
      agent: {
        family: 'Chrome',
        major: '91',
        os: { family: 'Windows', major: '10' }
      }
    })
    expect(next).toHaveBeenCalled()
  })

  it('should handle missing user-agent gracefully', () => {
    req.headers['user-agent'] = undefined
    jest.spyOn(useragent, 'lookup').mockReturnValue('N/A')

    const middleware = deviceMiddleware()
    middleware(req, res, next)

    expect(req.device).toEqual({
      ip: '192.168.1.1',
      agent: 'N/A'
    })
    expect(next).toHaveBeenCalled()
  })

  it('should handle errors and pass them to next', () => {
    jest.spyOn(requestIp, 'getClientIp').mockImplementation(() => {
      throw new Error('IP error')
    })

    const middleware = deviceMiddleware()
    middleware(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
