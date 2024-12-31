const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
const md5 = require('md5')

module.exports = class TokenManager {
  constructor({ config, cache }) {
    // if (!cache) throw new Error('Redis client is missing');

    this.config = config
    this.longTokenExpiresIn = '3y'
    this.shortTokenExpiresIn = '1y'
    this.userExposed = ['v1_createShortToken'] // exposed functions
    this.cache = cache

    // Wrapping Redis commands using utility functions
    this.setAsync = async ({ key, data, ttl }) =>
      await this.cache.key.set({ key, data, ttl })

    this.getAsync = async (key) => await this.cache.key.get({ key })

    this.deleteAsync = async (key) => await this.cache.key.delete({ key })
  }

  /**
   * short token are issue from long token
   * short tokens are issued for 72 hours
   * short tokens are connected to user-agent
   * short token are used on the soft logout
   * short tokens are used for account switch
   * short token represents a device.
   * long token represents a single user.
   *
   * long token contains immutable data and long lived
   * master key must exists on any device to create short tokens
   */
  genLongToken({ userId, userKey }) {
    return jwt.sign(
      {
        userKey,
        userId
      },
      this.config.dotEnv.LONG_TOKEN_SECRET,
      { expiresIn: this.longTokenExpiresIn }
    )
  }

  genShortToken({ userId, userKey, sessionId, deviceId }) {
    return jwt.sign(
      { userKey, userId, sessionId, deviceId },
      this.config.dotEnv.SHORT_TOKEN_SECRET,
      { expiresIn: this.shortTokenExpiresIn }
    )
  }

  _verifyToken({ token, secret }) {
    let decoded = null
    try {
      decoded = jwt.verify(token, secret)
    } catch (err) {
      console.log(err)
    }
    return decoded
  }

  verifyLongToken({ token }) {
    return this._verifyToken({
      token,
      secret: this.config.dotEnv.LONG_TOKEN_SECRET
    })
  }

  verifyShortToken({ token }) {
    return this._verifyToken({
      token,
      secret: this.config.dotEnv.SHORT_TOKEN_SECRET
    })
  }

  /** generate shortId based on a longId */
  v1_createShortToken({ __longToken, __device }) {
    const token = __longToken
    if (!token) return { errors: 'missing token ' }
    console.log('found token', token)

    let decoded = this.verifyLongToken({ token })
    if (!decoded) {
      return { errors: 'invalid' }
    }

    let shortToken = this.genShortToken({
      userId: decoded.userId,
      userKey: decoded.userKey,
      sessionId: nanoid(),
      deviceId: md5(__device)
    })

    return shortToken
  }

  async addToBlacklist(token, expiresIn) {
    const decoded = jwt.decode(token)
    if (!decoded) {
      throw new Error('Invalid token')
    }

    const ttl = expiresIn || decoded.exp - Math.floor(Date.now() / 1000)
    await this.setAsync({ key: `blacklist:${token}`, data: 'true', ttl })
  }

  async isBlacklisted(token) {
    const result = await this.getAsync(`blacklist:${token}`)

    return Boolean(result)
  }
}
