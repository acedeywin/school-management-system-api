const express           = require('express');
const userRoutes        = require('./User.route')
const authRoutes        = require('./Auth.route')
const schoolRoutes      = require('./School.route')
const roleRoutes        = require('./Role.route')

const routes = express.Router();

routes.use("/user", userRoutes);
routes.use("/auth", authRoutes);
routes.use('/school', schoolRoutes);
routes.use('/role', roleRoutes)

module.exports = routes;