module.exports = ({ managers, permission }) => {
  return (req, res, next) => {
    try {
      const role = req.user.userKey

      if (!permission.includes(role)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 401,
          errors: 'Unauthorized.',
          message: 'You are not authorized to perform this action.'
        })
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized'
      })
    }

    next()
  }
}
