const { validateSchema } = require('../managers/_common/schema.validators')

/**
 * Middleware to validate request payload against a schema
 * @param {Array<string>} schemaKeys - Array of schema keys to validate against
 * @returns {Function} Express middleware function
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing the payload to validate
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateRequest = (schemaKeys) => (req, res, next) => {
  try {
    for (const key of schemaKeys) {
      // Skip validation if the key is not in the request body
      if (req.body[key] === undefined) continue

      const validation = validateSchema(req.body, key)
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.error })
      }
    }
    next()
  } catch (error) {
    return res.status(500).json({ errors: error.message })
  }
}

module.exports = { validateRequest }
