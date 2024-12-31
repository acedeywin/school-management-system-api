const express = require('express')
const MongoLoader = require('../loaders/MongoLoader')
const StudentManager = require('../managers/entities/student/Student.manager')
const StudentController = require('../controllers/Student.controller')
const TokenManager = require('../managers/token/Token.manager')
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager')
const authMiddleware = require('../mws/__token.mw')
const roleMiddleware = require('../mws/__role.mw')
const queryMiddleware = require('../mws/__query.mw')
const enrollMiddleware = require('../mws/__enroll.mw')
const transferMiddleware = require('../mws/__transfer.mw')
const { validateRequest } = require('../mws/Middleware.manager')
const utils = require('../libs/utils')
const config = require('../config/index.config')
const cache = require('../cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS
})

const studentRoutes = express.Router()

// Initialize dependencies
const schoolModels = new MongoLoader({
  schemaExtension: 'school.schema.js'
}).load()
const classroomModels = new MongoLoader({
  schemaExtension: 'classroom.schema.js'
}).load()
const studentModels = new MongoLoader({
  schemaExtension: 'student.schema.js'
}).load()

const tokenManager = new TokenManager({ config, cache })
const responseDispatcher = new ResponseDispatcher()

const studentManager = new StudentManager({
  utils,
  studentModels,
  schoolModels,
  classroomModels
})
const studentController = new StudentController({ studentManager })

studentRoutes.post(
  '/enroll',
  validateRequest([
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'dateOfBirth'
  ]),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['schoolId', 'classroomId'],
    managers: { responseDispatcher }
  }),
  enrollMiddleware({
    managers: { responseDispatcher },
    mongoModels: { classroomModels, schoolModels, studentModels }
  }),
  studentController.enrollStudent.bind(studentController)
)

studentRoutes.put(
  '/transfer',
  validateRequest(['transferHistory']),
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['studentId'],
    managers: { responseDispatcher }
  }),
  transferMiddleware({
    managers: { responseDispatcher },
    mongoModels: { classroomModels, schoolModels, studentModels }
  }),
  studentController.transferStudent.bind(studentController)
)

studentRoutes.get(
  '/students',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['schoolId'],
    managers: { responseDispatcher }
  }),
  studentController.getStudents.bind(studentController)
)

studentRoutes.get(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['studentId'],
    managers: { responseDispatcher }
  }),
  studentController.getStudentById.bind(studentController)
)

studentRoutes.put(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['studentId'],
    managers: { responseDispatcher }
  }),
  studentController.updateStudent.bind(studentController)
)

studentRoutes.delete(
  '/',
  authMiddleware({ managers: { responseDispatcher, token: tokenManager } }),
  roleMiddleware({
    managers: { responseDispatcher },
    permission: ['superadmin', 'schooladmin']
  }),
  queryMiddleware({
    query: ['studentId'],
    managers: { responseDispatcher }
  }),
  studentController.deleteStudent.bind(studentController)
)

module.exports = studentRoutes
