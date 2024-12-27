const express = require('express');

const userRoutes = require('./User.route')
const authRoutes = require('./Auth.route')

const routes = express.Router();

routes.use("/user", userRoutes);
routes.use("/auth", authRoutes);


module.exports = routes;