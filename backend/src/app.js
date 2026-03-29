const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.use('/health', healthRoutes);
app.use(`${config.apiBasePath}/health`, healthRoutes);

app.use(`${config.apiBasePath}/*`, (_req, res) => {
  res.status(404).json({
    success: false,
    error_code: 'RESOURCE_NOT_FOUND',
    error_message: 'The requested resource was not found',
  });
});

app.use(errorHandler);

module.exports = app;
