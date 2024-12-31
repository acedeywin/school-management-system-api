const { validateSchema } = require('../managers/_common/schema.validators')

const validateRequest = (schemaKeys) => (req, res, next) => {
  try {
    schemaKeys.forEach((key) => {
      // Skip validation if the key is not in the request body
      if (req.body[key] === undefined) return

      const validation = validateSchema(req.body, key)
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.error })
      }
    })
    next()
  } catch (error) {
    return res.status(500).json({ errors: error.message })
  }
}

const validateSchoolAdministrator = (mongoModel) => (req, res, next) => {
  let { schoolId, adminId } = req.query

  if (!schoolId) {
    schoolId = req.user.schoolId
  }

  mongoModel
    .findById(schoolId)
    .then((school) => {
      if (!school) {
        return res.status(404).json({ errors: 'School not found' })
      }

      if (!school.administrators.includes(adminId)) {
        return res.status(400).json({
          errors:
            'The provided administrator is not associated with this school'
        })
      }

      next()
    })
    .catch((error) => {
      console.error('Validation errors:', error)
      res.status(500).json({ errors: error.message })
    })
}

module.exports = { validateRequest, validateSchoolAdministrator }
