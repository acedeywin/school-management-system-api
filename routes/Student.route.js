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

/**
 * @route POST /enroll
 * @description Enrolls a new student into a school and classroom.
 * @middleware validateRequest, authMiddleware, roleMiddleware, queryMiddleware, enrollMiddleware
 * @param {string} firstName - First name of the student (from body).
 * @param {string} lastName - Last name of the student (from body).
 * @param {string} email - Email address of the student (from body).
 * @param {string} phoneNumber - Phone number of the student (from body).
 * @param {Date} dateOfBirth - Date of birth of the student (from body).
 * @param {string} schoolId - ID of the school (from query).
 * @param {string} classroomId - ID of the classroom (from query).
 */
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

/**
 * @route PUT /transfer
 * @description Transfers a student to a different school and/or classroom.
 * @middleware validateRequest, authMiddleware, roleMiddleware, queryMiddleware, transferMiddleware
 * @param {string} toSchool - ID of the new school (from body.transferHistory).
 * @param {string} toClassroom - ID of the new classroom (from body.transferHistory).
 * @param {Date} transferDate - Date of the transfer (from body.transferHistory).
 * @param {string} studentId - ID of the student to transfer (from query).
 */
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

/**
 * @route GET /students
 * @description Retrieves a list of students in a specified school.
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 * @param {string} schoolId - ID of the school (from query).
 * @param {number} page - Page number for pagination (default: 1, from query).
 * @param {number} limit - Number of records per page (default: 10, from query).
 */
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

/**
 * @route GET /
 * @description Retrieves details of a specific student by their ID.
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 * @param {string} studentId - ID of the student (from query).
 */
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

/**
 * @route PUT /
 * @description Updates details of a student.
 * @middleware validateRequest, authMiddleware, roleMiddleware, queryMiddleware
 * @param {string} studentId - ID of the student to update (from query).
 * @param {Object} updates - Fields to update (from body).
 */
studentRoutes.put(
  '/',
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
    query: ['studentId'],
    managers: { responseDispatcher }
  }),
  studentController.updateStudent.bind(studentController)
)

/**
 * @route DELETE /
 * @description Deletes a student by their ID.
 * @middleware authMiddleware, roleMiddleware, queryMiddleware
 * @param {string} studentId - ID of the student to delete (from query).
 */
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
