module.exports = ({ query, managers }) => {
  return (req, res, next) => {
    try {
      // Ensure `query` is provided and is an array
      if (!Array.isArray(query)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 400,
          errors: 'Invalid.',
          message:
            'Invalid query validation configuration. Expected an array of parameters.'
        })
      }

      // Collect missing parameters
      const missingParams = query.filter((param) => !req.query[param])

      // If any parameters are missing, return an error
      if (missingParams.length > 0) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 400,
          errors: 'Invalid.',
          message: `Missing required query parameters: ${missingParams.join(', ')}`
        })
      }

      // All parameters are present; continue
      next()
    } catch (error) {
      console.error('Query params middleware errors:', error)
      next(error)
    }
  }
}
