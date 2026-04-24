const jwt = require('jsonwebtoken');
const { jwt: cfg } = require('../config/app.config');

const sign = (payload) => jwt.sign(payload, cfg.secret, { expiresIn: cfg.expiresIn });
const verify = (token) => jwt.verify(token, cfg.secret);

module.exports = { sign, verify };
