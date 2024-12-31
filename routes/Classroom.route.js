const express = require('express')
const MongoLoader = require('../loaders/MongoLoader')
const TokenManager = require('../managers/token/Token.manager')
const ClassroomManager = require('../managers/entities/classroom/Classroom.manager')
const ClassroomController = require('../controllers/Classroom.controller')
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

const classroomRoutes = express.Router()

// Initialize dependencies
const schoolModels = new MongoLoader({
  schemaExtension: 'school.schema.js'
}).load()
const classroomModels = new MongoLoader({
  schemaExtension: 'classroom.schema.js'
}).load()

const tokenManager = new TokenManager({ config, cache })
const responseDispatcher = new ResponseDispatcher()

const classroomManager = new ClassroomManager({
  utils,
  schoolModels,
  classroomModels
})

const classroomController = new ClassroomController({ classroomManager })

/**
 * @route POST /
 * @description Create a new classroom
 * @middleware validateRequest, authMiddleware, roleMiddleware, queryMiddleware
 */
classroomRoutes.post(
  '/',
  validateRequest(['name', 'capacity', 'resources']),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['schoolId'],
    managers: { responseDispatcher }
  }),
  classroomController.createClassroom.bind(classroomController)
)

/**
 * @route GET /classrooms
 * @description Get classrooms for a school
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 */
classroomRoutes.get(
  '/classrooms',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['schoolId'],
    managers: { responseDispatcher }
  }),
  classroomController.getClassrooms.bind(classroomController)
)

/**
 * @route GET /
 * @description Get a classroom by ID
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 */
classroomRoutes.get(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['classroomId'],
    managers: { responseDispatcher }
  }),
  classroomController.getClassroomById.bind(classroomController)
)

/**
 * @route PUT /
 * @description Update a classroom
 * @middleware validateRequest, authMiddleware, roleMiddleware, queryMiddleware
 */
classroomRoutes.put(
  '/',
  validateRequest(['name', 'capacity', 'resources']),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['classroomId'],
    managers: { responseDispatcher }
  }),
  classroomController.updateClassroom.bind(classroomController)
)

/**
 * @route DELETE /
 * @description Delete a classroom
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 */
classroomRoutes.delete(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['classroomId'],
    managers: { responseDispatcher }
  }),
  classroomController.deleteClassroom.bind(classroomController)
)

module.exports = classroomRoutes
