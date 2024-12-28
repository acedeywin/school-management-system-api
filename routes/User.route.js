const express               = require('express');
const MongoLoader           = require('../loaders/MongoLoader');
const TokenManager          = require('../managers/token/Token.manager');
const UserManager           = require('../managers/entities/user/User.manager');
const UserController        = require('../controllers/User.controller');
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const config                = require('../config/index.config');
const { validateRequest }   = require('../mws/Middleware.manager');
const utils                 = require('../libs/utils')
const authMiddleware      = require('../mws/__token.mw')
const roleMiddleware        = require('../mws/__role.mw')

const userRoutes = express.Router();

// Initialize dependencies
const userModels = new MongoLoader({ schemaExtension: 'user.schema.js' }).load();
const roleModels = new MongoLoader({ schemaExtension: 'role.schema.js' }).load();

const tokenManager = new TokenManager({ config });
const responseDispatcher = new ResponseDispatcher()

const userManager = new UserManager({
    utils,
    managers: { token: tokenManager },
    userModels,
    roleModels,
});

const userController = new UserController({ userManager });

// Define routes
userRoutes.post('/create-user', validateRequest(['username', 'email', 'password', 'role']), authMiddleware({ managers: { responseDispatcher, token: tokenManager  } }), roleMiddleware({ managers: { responseDispatcher }, permission: ['superadmin'] }), userController.createUser.bind(userController));

userRoutes.post('/superadmin', validateRequest(['username', 'email', 'password']),  userController.createSuperadmin.bind(userController));

module.exports = userRoutes;
