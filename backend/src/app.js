const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const humanRoutes = require('./routes/humanRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.use('/health', healthRoutes);
app.use(`${config.apiBasePath}/health`, healthRoutes);
app.use(`${config.apiBasePath}/human`, humanRoutes);
app.use(`${config.apiBasePath}/invitations`, invitationRoutes);
app.use(`${config.apiBasePath}/agents`, agentRoutes);

app.use(`${config.apiBasePath}/*`, (_req, res) => {
  res.status(404).json({
    success: false,
    error_code: 'RESOURCE_NOT_FOUND',
    error_message: 'The requested resource was not found',
  });
});

app.use(errorHandler);

module.exports = app;
