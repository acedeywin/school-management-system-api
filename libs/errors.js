/**
 * Represents an error for when a requested resource is not found.
 */
class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.status = 404 // HTTP status code for "Not Found"
    this.name = 'NotFoundError' // Set the name of the error class
  }
}

/**
 * Represents an error for invalid or bad client requests.
 */
class BadRequestError extends Error {
  constructor(message = 'Bad request') {
    super(message)
    this.status = 400 // HTTP status code for "Bad Request"
    this.name = 'BadRequestError' // Set the name of the error class
  }
}

/**
 * A general-purpose custom error class for defining application-specific errors.
 */
class CustomError extends Error {
  constructor(message = 'An error occurred', status = 500) {
    super(message)
    this.status = status // Assign the provided status code
    this.name = 'CustomError' // Set the name of the error class
  }
}

module.exports = {
  NotFoundError,
  BadRequestError,
  CustomError
}
