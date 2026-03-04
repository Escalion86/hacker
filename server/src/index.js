const env = require('./config/env');
const { connectDb } = require('./config/db');
const { createApp } = require('./app');

async function main() {
  await connectDb(env.mongoUri);
  const app = createApp(env);
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on :${env.port}`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[fatal]', error);
  process.exit(1);
});
