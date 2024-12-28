const { validateCreate } = require('../managers/_common/schema.validators')

const validateRequest = (schemaKeys) => (req, res, next) => {
  try {
    schemaKeys.forEach((key) => {
      const validation = validateCreate(req.body, key)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }
    })
    next()
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

module.exports = { validateRequest }
