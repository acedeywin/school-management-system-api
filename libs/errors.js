/**
 * Represents an error for when a requested resource is not found.
 */
class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.status = 404
    this.name = 'NotFoundError'
  }
}

/**
 * Represents an error for invalid or bad client requests.
 */
class BadRequestError extends Error {
  constructor(message = 'Bad request') {
    super(message)
    this.status = 400
    this.name = 'BadRequestError'
  }
}

/**
 * A general-purpose custom error class for defining application-specific errors.
 */
class CustomError extends Error {
  constructor(message = 'An error occurred', status = 500) {
    super(message)
    this.status = status
    this.name = 'CustomError'
  }
}

module.exports = {
  NotFoundError,
  BadRequestError,
  CustomError
}
