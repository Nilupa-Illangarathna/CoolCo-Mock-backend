require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  httpsPort: parseInt(process.env.HTTPS_PORT, 10) || 4443,
  jwt: {
    secret: process.env.JWT_SECRET || 'coolco_dev_secret_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  },
};
