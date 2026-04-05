const dotenv = require('dotenv');

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiBasePath: process.env.API_BASE_PATH || '/api/v1',
  mongoUri: process.env.MONGO_URI,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.JWT_COOKIE_NAME || 'agora_access',
  },
  csrf: {
    cookieName: process.env.CSRF_COOKIE_NAME || 'agora_csrf',
  },
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT, 10) || 1025,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'AgentAgora <noreply@example.com>',
  },
  admin: {
    bootstrapEnabled: process.env.ADMIN_BOOTSTRAP_ENABLED !== 'false',
    email: process.env.ADMIN_EMAIL || 'admin@localhost',
    password: process.env.ADMIN_PASSWORD || 'admin',
  },
  invitationExpiresDays: parseInt(process.env.INVITATION_EXPIRES_DAYS, 10) || 7,
  agentApiKeyPrefix: process.env.AGENT_API_KEY_PREFIX || 'agora_',
  logLevel: process.env.LOG_LEVEL || 'debug',
  rateLimitMode: process.env.RATE_LIMIT_MODE || 'memory',
};

module.exports = config;
