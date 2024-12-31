/**
 * @file Role.routes.js
 * @description Defines and initializes routes for role management.
 */

const express = require('express')
const MongoLoader = require('../loaders/MongoLoader')
const RoleManager = require('../managers/entities/role/Role.manager')
const RoleController = require('../controllers/Role.controller')
const TokenManager = require('../managers/token/Token.manager')
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager')
const authMiddleware = require('../mws/__token.mw')
const roleMiddleware = require('../mws/__role.mw')
const queryMiddleware = require('../mws/__query.mw')
const config = require('../config/index.config')
const cache = require('../cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS
})

const roleRoutes = express.Router()

// Initialize dependencies
const mongoModels = new MongoLoader({
  schemaExtension: 'role.schema.js'
}).load()
const roleManager = new RoleManager({ mongoModels })
const responseDispatcher = new ResponseDispatcher()
const tokenManager = new TokenManager({ config, cache })

const roleController = new RoleController({ roleManager })

/**
 * @route POST /create-role
 * @description Creates a new role
 * @middleware authMiddleware, roleMiddleware
 */
roleRoutes.post(
  '/create-role',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  roleController.createRole.bind(roleController)
)

/**
 * @route GET /roles
 * @description Fetches all roles
 * @middleware authMiddleware, roleMiddleware
 */
roleRoutes.get(
  '/roles',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  roleController.getRoles.bind(roleController)
)

/**
 * @route GET /
 * @description Fetches a role by ID
 * @middleware authMiddleware, queryMiddleware, roleMiddleware
 */
roleRoutes.get(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  queryMiddleware({ query: ['roleId'], managers: { responseDispatcher } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  roleController.getRoleById.bind(roleController)
)

module.exports = roleRoutes
