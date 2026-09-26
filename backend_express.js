require('dotenv').config();
const { app, start } = require('./src/server');

start();

module.exports = app;
