const config = require('./config/env');
const connectDB = require('./config/db');
const seedDefaults = require('./utils/seedDefaults');
const app = require('./app');

async function boot() {
  await connectDB();
  await seedDefaults();

  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
}

boot();
