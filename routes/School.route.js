const express = require('express')
const MongoLoader = require('../loaders/MongoLoader')
const SchoolManager = require('../managers/entities/school/School.manager')
const SchoolController = require('../controllers/School.controller')
const TokenManager = require('../managers/token/Token.manager')
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager')
const config = require('../config/index.config')
const validateRequest = require('../mws/__validateRequest.mw')
const { validateSchema } = require('../managers/_common/schema.validators')
const authMiddleware = require('../mws/__token.mw')
const queryMiddleware = require('../mws/__query.mw')
const roleMiddleware = require('../mws/__role.mw')
const utils = require('../libs/utils')
const cache = require('../cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS
})

const schoolRoutes = express.Router()

// Initialize MongoDB models
const mongoModels = new MongoLoader({
  schemaExtension: 'school.schema.js'
}).load()

// Initialize necessary managers
const tokenManager = new TokenManager({ config, cache })
const responseDispatcher = new ResponseDispatcher()

const schoolManager = new SchoolManager({
  utils,
  mongoModels
})

const schoolController = new SchoolController({ schoolManager })

/**
 * @route POST /create-school
 * @description Creates a new school
 * @middleware validateRequest, authMiddleware, roleMiddleware
 * @param {string} name - Name of the school
 * @param {string} address - Address of the school
 * @param {string} phoneNumber - Phone number of the school
 * @param {string} email - Email address of the school
 * @param {string} website - Website URL of the school
 * @param {Array<string>} administrators - List of administrator IDs
 */
schoolRoutes.post(
  '/create-school',
  validateRequest({
    managers: { responseDispatcher, validateSchema },
    schemaKeys: [
      'name',
      'address',
      'phoneNumber',
      'email',
      'website',
      'administrators'
    ]
  }),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  schoolController.createSchool.bind(schoolController)
)

/**
 * @route GET /schools
 * @description Fetches all schools for the authenticated administrator
 * @middleware authMiddleware, roleMiddleware
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of records per page
 */
schoolRoutes.get(
  '/schools',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  schoolController.getSchools.bind(schoolController)
)

/**
 * @route GET /
 * @description Fetches details of a school by its ID
 * @middleware authMiddleware, queryMiddleware, roleMiddleware
 * @param {string} schoolId - ID of the school to fetch
 */
schoolRoutes.get(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  queryMiddleware({ query: ['schoolId'], managers: { responseDispatcher } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  schoolController.getSchoolById.bind(schoolController)
)

/**
 * @route PUT /
 * @description Updates details of a school
 * @middleware validateRequest, authMiddleware, queryMiddleware, roleMiddleware
 * @param {string} schoolId - ID of the school to update
 * @param {Object} updates - Fields to update in the school
 */
schoolRoutes.put(
  '/',
  validateRequest({
    managers: { responseDispatcher, validateSchema },
    schemaKeys: [
      'name',
      'address',
      'phoneNumber',
      'email',
      'website',
      'administrators',
      'classrooms'
    ]
  }),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  queryMiddleware({ query: ['schoolId'], managers: { responseDispatcher } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  schoolController.updateSchool.bind(schoolController)
)

/**
 * @route DELETE /
 * @description Deletes a school
 * @middleware authMiddleware, queryMiddleware, roleMiddleware
 * @param {string} schoolId - ID of the school to delete
 */
schoolRoutes.delete(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  queryMiddleware({ query: ['schoolId'], managers: { responseDispatcher } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin']
  }),
  schoolController.deleteSchool.bind(schoolController)
)

module.exports = schoolRoutes
