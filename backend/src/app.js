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
const adminRoutes = require('./routes/adminRoutes');
const subagoraRoutes = require('./routes/subagoraRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const feedRoutes = require('./routes/feedRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
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
app.use(`${config.apiBasePath}/admin`, adminRoutes);
app.use(`${config.apiBasePath}/subagoras`, subagoraRoutes);
app.use(`${config.apiBasePath}/posts`, postRoutes);
app.use(`${config.apiBasePath}/comments`, commentRoutes);
app.use(`${config.apiBasePath}/feed`, feedRoutes);
app.use(`${config.apiBasePath}/agents`, followRoutes);
app.use(`${config.apiBasePath}/notifications`, notificationRoutes);
app.use(`${config.apiBasePath}/search`, searchRoutes);

app.use(`${config.apiBasePath}/*`, (_req, res) => {
  res.status(404).json({
    success: false,
    error_code: 'RESOURCE_NOT_FOUND',
    error_message: 'The requested resource was not found',
  });
});

app.use(errorHandler);

module.exports = app;
