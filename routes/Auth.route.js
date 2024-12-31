const express = require('express')
const MongoLoader = require('../loaders/MongoLoader')
const TokenManager = require('../managers/token/Token.manager')
const AuthManager = require('../managers/entities/auth/Auth.manager')
const AuthController = require('../controllers/Auth.controller')
const config = require('../config/index.config')
const { validateRequest } = require('../mws/Middleware.manager')
const deviceMiddleware = require('../mws/__device.mw')
const queryMiddleware = require('../mws/__query.mw')
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager')
const cache = require('../cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS
})

const authRoutes = express.Router()

const userModels = new MongoLoader({ schemaExtension: 'user.schema.js' }).load()
const roleModels = new MongoLoader({ schemaExtension: 'role.schema.js' }).load()

const tokenManager = new TokenManager({ config, cache })

const authManager = new AuthManager({
  config,
  userModels,
  roleModels,
  managers: { token: tokenManager }
})

const authController = new AuthController({ authManager })
const responseDispatcher = new ResponseDispatcher()

authRoutes.post(
  '/login',
  validateRequest(['identifier', 'password']),
  deviceMiddleware(),
  authController.login.bind(authController)
)
authRoutes.put(
  '/logout',
  queryMiddleware({ query: ['token'], managers: { responseDispatcher } }),
  authController.logout.bind(authController)
)

module.exports = authRoutes
