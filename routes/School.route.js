const express               = require('express');
const MongoLoader           = require('../loaders/MongoLoader');
const SchoolManager         = require('../managers/entities/school/School.manager');
const SchoolController      = require('../controllers/School.controller');
const TokenManager          = require('../managers/token/Token.manager');
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const config                = require('../config/index.config');
const { validateRequest }   = require('../mws/Middleware.manager');
const authMiddleware      = require('../mws/__token.mw')
const queryMiddleware       = require('../mws/__query.mw');
const roleMiddleware        = require('../mws/__role.mw')
const utils                 = require('../libs/utils')
const cache                 = require('../cache/cache.dbh')({
                                prefix: config.dotEnv.CACHE_PREFIX,
                                url: config.dotEnv.CACHE_REDIS
                                });

const schoolRoutes = express.Router();

const mongoModels = new MongoLoader({ schemaExtension: 'school.schema.js' }).load();

const tokenManager = new TokenManager({ config, cache });
const responseDispatcher = new ResponseDispatcher()

const schoolManager = new SchoolManager({
    utils,
    mongoModels,
});

const schoolController = new SchoolController({ schoolManager })

schoolRoutes.post('/create-school', validateRequest(['name', 'address', 'phoneNumber', 'email', 'website', 'administrators']), authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), schoolController.createSchool.bind(schoolController))
schoolRoutes.get('/schools', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin', 'schooladmin'] }), schoolController.getSchools.bind(schoolController))
schoolRoutes.get('/', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), queryMiddleware({query: 'schoolId' }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin', 'schooladmin'] }), schoolController.getSchoolById.bind(schoolController))
schoolRoutes.put('/', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), queryMiddleware({query: 'schoolId' }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), schoolController.updateSchool.bind(schoolController))
schoolRoutes.delete('/', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), queryMiddleware({query: 'schoolId' }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), schoolController.deleteSchool.bind(schoolController))


module.exports = schoolRoutes
