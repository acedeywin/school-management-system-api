const useragent = require('useragent')
const requestIp = require('request-ip')

module.exports = () => {
  return (req, res, next) => {
    try {
      const ip = requestIp.getClientIp(req) || 'N/A'
      const agent = useragent.lookup(req.headers['user-agent']) || 'N/A'
      const device = { ip, agent }

      req.device = device

      next()
    } catch (error) {
      console.error('Device middleware error:', error)
      next(error)
    }
  }
}
