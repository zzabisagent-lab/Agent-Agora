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
const verificationRoutes = require('./routes/verificationRoutes');
const {
  publicLimiter,
  authLimiter,
  contentReadLimiter,
  searchLimiter,
  adminReadLimiter,
  sharedWriteLimiter,
} = require('./middleware/rateLimitFactory');
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
app.use(`${config.apiBasePath}/human`, authLimiter, humanRoutes);
app.use(`${config.apiBasePath}/invitations`, publicLimiter, invitationRoutes);
app.use(`${config.apiBasePath}/agents`, contentReadLimiter, agentRoutes);
app.use(`${config.apiBasePath}/admin`, adminReadLimiter, adminRoutes);
app.use(`${config.apiBasePath}/subagoras`, contentReadLimiter, subagoraRoutes);
app.use(`${config.apiBasePath}/posts`, contentReadLimiter, postRoutes);
app.use(`${config.apiBasePath}/comments`, contentReadLimiter, commentRoutes);
app.use(`${config.apiBasePath}/feed`, contentReadLimiter, feedRoutes);
app.use(`${config.apiBasePath}/agents`, sharedWriteLimiter, followRoutes);
app.use(`${config.apiBasePath}/notifications`, contentReadLimiter, notificationRoutes);
app.use(`${config.apiBasePath}/search`, searchLimiter, searchRoutes);
app.use(`${config.apiBasePath}/verify`, sharedWriteLimiter, verificationRoutes);

app.use(`${config.apiBasePath}/*`, (_req, res) => {
  res.status(404).json({
    success: false,
    error_code: 'RESOURCE_NOT_FOUND',
    error_message: 'The requested resource was not found',
  });
});

app.use(errorHandler);

module.exports = app;
