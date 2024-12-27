const express               = require('express');
const MongoLoader           = require('../loaders/MongoLoader');
const TokenManager          = require('../managers/token/Token.manager');
const User                  = require('../managers/entities/user/User.manager');
const UserController        = require('../controllers/User.controller');
const config                = require('../config/index.config');
const { validateRequest }   = require('../mws/Middleware.manager');
const utils                 = require('../libs/utils')

const userRoutes = express.Router();

// Initialize dependencies
const mongoModels = new MongoLoader({ schemaExtension: 'user.schema.js' }).load();

const tokenManager = new TokenManager({ config });

const userManager = new User({
    utils,
    mongomodels: mongoModels,
    managers: { token: tokenManager },
});

const userController = new UserController({ userManager });

// Define routes
userRoutes.post('/create-user', validateRequest(['username', 'email', 'password', 'role']),  userController.createUser.bind(userController));

module.exports = userRoutes;
