module.exports = ({ managers, schemaKeys }) => {
  return (req, res, next) => {
    try {
      for (const key of schemaKeys) {
        // Skip validation if the key is not in the request body
        if (req.body[key] === undefined) continue

        const validation = managers.validateSchema(req.body, key)
        if (!validation.valid) {
          return managers.responseDispatcher.dispatch(res, {
            ok: false,
            code: 401,
            errors: validation.error
          })
        }
      }
      next()
    } catch (error) {
      console.error('Validate request middleware errors:', error)
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: error.message
      })
    }
  }
}
