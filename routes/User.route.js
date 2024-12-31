const express = require('express')
const bcrypt = require('bcrypt')
const MongoLoader = require('../loaders/MongoLoader')
const TokenManager = require('../managers/token/Token.manager')
const UserManager = require('../managers/entities/user/User.manager')
const UserController = require('../controllers/User.controller')
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager')
const config = require('../config/index.config')
const { validateRequest } = require('../mws/Middleware.manager')
const utils = require('../libs/utils')
const authMiddleware = require('../mws/__token.mw')
const roleMiddleware = require('../mws/__role.mw')
const queryMiddleware = require('../mws/__query.mw')
const cache = require('../cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS
})

const userRoutes = express.Router()

// Initialize dependencies
const userModels = new MongoLoader({ schemaExtension: 'user.schema.js' }).load()
const roleModels = new MongoLoader({ schemaExtension: 'role.schema.js' }).load()

const tokenManager = new TokenManager({ config, cache })
const responseDispatcher = new ResponseDispatcher()

const userManager = new UserManager({
  bcrypt,
  utils,
  managers: { token: tokenManager },
  userModels,
  roleModels
})

const userController = new UserController({ userManager })

// Define routes
/**
 * @route POST /create-user
 * @description Create a new user
 * @middleware validateRequest, authMiddleware, roleMiddleware
 */
userRoutes.post(
  '/create-user',
  validateRequest(['username', 'email', 'password', 'role']),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  userController.createUser.bind(userController)
)

/**
 * @route POST /superadmin
 * @description Create a superadmin user
 * @middleware validateRequest
 */
userRoutes.post(
  '/superadmin',
  validateRequest(['username', 'email', 'password']),
  userController.createSuperadmin.bind(userController)
)

/**
 * @route GET /users
 * @description Get a list of users
 * @middleware authMiddleware, roleMiddleware
 */
userRoutes.get(
  '/users',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  userController.getUsers.bind(userController)
)

/**
 * @route GET /
 * @description Get user details by ID
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 */
userRoutes.get(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['userId'],
    managers: { responseDispatcher }
  }),
  userController.getuserById.bind(userController)
)

/**
 * @route PUT /
 * @description Update user profile
 * @middleware validateRequest, authMiddleware, roleMiddleware, queryMiddleware
 */
userRoutes.put(
  '/',
  validateRequest(['username', 'email', 'password', 'role', 'schools']),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['userId'],
    managers: { responseDispatcher }
  }),
  userController.updateUserProfile.bind(userController)
)

/**
 * @route DELETE /
 * @description Delete user profile
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 */
userRoutes.delete(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  queryMiddleware({
    query: ['userId'],
    managers: { responseDispatcher }
  }),
  userController.deleteUserProfile.bind(userController)
)

module.exports = userRoutes
