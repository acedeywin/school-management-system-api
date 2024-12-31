/* eslint-disable no-unused-vars */
module.exports = ({ config, managers }) => {
  return async (req, res, next) => {
    if (!managers.responseDispatcher) {
      console.error('responseDispatcher is not defined')
      return res.status(500).json({
        ok: false,
        code: 500,
        errors: 'Internal server errors: responseDispatcher not found'
      })
    }

    const authHeader = req.headers.authorization

    if (!authHeader) {
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized',
        message: 'Authorization header missing'
      })
    }

    const token = authHeader.split(' ')[1]

    const blacklisted = await managers.token.isBlacklisted(token)

    if (blacklisted) {
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized',
        message: 'Session expired.'
      })
    }

    let decoded = null
    try {
      decoded = managers.token.verifyShortToken({ token })
      if (!decoded) {
        console.log('Failed to decode token')
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 401,
          errors: 'Unauthorized',
          message: 'You are not authorized to perform this action.'
        })
      }
    } catch (err) {
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized'
      })
    }

    req.user = decoded
    next()
  }
}
