const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  mongoUri: required('MONGODB_URI'),
  adminApiKey: required('ADMIN_API_KEY'),
  accessCodePepper: required('ACCESS_CODE_PEPPER'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;
