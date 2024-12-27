const express               = require('express');
const MongoLoader           = require('../loaders/MongoLoader');
const TokenManager          = require('../managers/token/Token.manager');
const Auth                  = require('../managers/entities/auth/Auth.manager');
const AuthController        = require('../controllers/Auth.controller');
const config                = require('../config/index.config');
const cache                 = require('../cache/cache.dbh')({
                                prefix: config.dotEnv.CACHE_PREFIX,
                                url: config.dotEnv.CACHE_REDIS
                                });

const authRoutes = express.Router();

const mongoModels = new MongoLoader({ schemaExtension: 'user.schema.js' }).load();

const tokenManager = new TokenManager({ config, cache });

const authManager = new Auth({
    config,
    mongomodels: mongoModels,
    managers: { token: tokenManager },
});

const authController = new AuthController({ authManager })

authRoutes.post('/login', authController.login.bind(authController))
authRoutes.put('/logout', authController.logout.bind(authController))


module.exports = authRoutes;