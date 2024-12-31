/**
 * Middleware to validate user permissions for a specific action.
 *
 * @param {Object} managers - Manager objects for handling operations and dispatching responses.
 * @param {Array} permission - An array of roles that are authorized to perform the action.
 * @returns {Function} Middleware function to validate user permissions.
 */
module.exports = ({ managers, permission }) => {
  return (req, res, next) => {
    try {
      const role = req.user.userKey

      // Check if the user's role is included in the allowed permissions
      if (!permission.includes(role)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 401,
          errors: 'Unauthorized.',
          message: 'You are not authorized to perform this action.'
        })
      }
    } catch (error) {
      console.error('Permission middleware errors:', error)
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized'
      })
    }

    next()
  }
}
