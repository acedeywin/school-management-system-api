const express               = require('express');
const MongoLoader           = require('../loaders/MongoLoader');
const RoleManager           = require('../managers/entities/role/Role.manager');
const RoleController        = require('../controllers/Role.controller');
const TokenManager          = require('../managers/token/Token.manager');
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const authMiddleware      = require('../mws/__token.mw')
const roleMiddleware        = require('../mws/__role.mw')
const queryMiddleware       = require('../mws/__query.mw');
const config                = require('../config/index.config');

const roleRoutes = express.Router();

const mongoModels = new MongoLoader({ schemaExtension: 'role.schema.js' }).load();
const roleManager = new RoleManager({ mongoModels })
const responseDispatcher = new ResponseDispatcher()
const tokenManager = new TokenManager({ config });

const roleController = new RoleController({ roleManager })

roleRoutes.post('/create-role', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), roleController.createRole.bind(roleController))
roleRoutes.get('/roles', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), roleController.getRoles.bind(roleController))
roleRoutes.get('/', authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), queryMiddleware({query: 'roleId' }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), roleController.getRoleById.bind(roleController))

module.exports = roleRoutes;
