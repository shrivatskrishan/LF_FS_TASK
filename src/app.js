const express = require('express');
const corsMiddleware = require('./middleware/cors');
const requestContext = require('./middleware/requestContext');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(requestContext);
app.use(corsMiddleware);
app.use(express.json());
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
