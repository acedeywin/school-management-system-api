/* eslint-disable no-unused-vars */
module.exports = ({ query, config, managers }) => {
  return (req, res, next) => {
    try {
      // Check if query parameters are missing
      if (!req.query || Object.keys(req.query).length === 0) {
        return res.status(400).json({
          success: false,
          message: `Query parameters are required. Missing: ${query}`
        })
      }
      next()
    } catch (error) {
      console.error('Query params middleware error:', error)
      next(error)
    }
  }
}
