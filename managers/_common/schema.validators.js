/**
 * Validates data against predefined schema rules.
 *
 * @param {Object} data - The data object containing the value to validate.
 * @param {string} schemaKey - The key in the schema to validate against.
 * @throws {NotFoundError} If no validation rules are defined for the provided schemaKey.
 * @throws {BadRequestError} If the data fails validation against the schema rules.
 * @returns {Object} An object indicating validation success: { valid: true }.
 */
const { BadRequestError, NotFoundError } = require('../../libs/errors')
const schema = require('./schema.models')

const validateSchema = (data, schemaKey) => {
  const rules = schema[schemaKey]

  if (!rules) {
    throw new NotFoundError(`No validation rules defined for ${schemaKey}`)
  }

  const value =
    typeof rules.path === 'string'
      ? data[rules.path]?.trim?.() || data[rules.path]
      : data[rules.path]

  // Validate type
  const expectedType = rules.type.toLowerCase()
  const actualType = Array.isArray(value) ? 'object' : typeof value

  if (value && expectedType !== actualType) {
    throw new BadRequestError(`${rules.path} should be of type ${rules.type}`)
  }

  // Validate if capacity should be greater than zero
  if (schemaKey === 'capacity' && typeof value === 'number' && value <= 0) {
    throw new BadRequestError(`${rules.path} should be greater than zero`)
  }

  // Validate length for strings, arrays, and objects
  if (rules.length) {
    const valueLength =
      actualType === 'string' || Array.isArray(value)
        ? value.length
        : actualType === 'object'
          ? Object.keys(value).length
          : 0

    if (valueLength < rules.length.min || valueLength > rules.length.max) {
      throw new BadRequestError(
        `${rules.path} should be between ${rules.length.min} and ${rules.length.max} ${actualType === 'object' ? 'keys' : 'characters'}`
      )
    }
  }

  // Validate regex for strings
  if (rules.regex && actualType === 'string' && !rules.regex.test(value)) {
    throw new BadRequestError(
      `${rules.path} does not match the required ${rules.path} pattern`
    )
  }

  // Validate custom rules
  if (rules.rules) {
    const errors = rules.rules
      .filter((rule) => !rule.regex.test(value))
      .map((rule) => rule.error)

    if (errors.length > 0) {
      throw new BadRequestError(errors[0])
    }
  }

  return { valid: true }
}

module.exports = { validateSchema }
