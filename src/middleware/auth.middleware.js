const { verify } = require('../utils/jwt.util');
const store = require('../config/store');

function authenticate(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.json({ is_success: false, message: 'No token provided' });
  try {
    const decoded = verify(token);
    const user = store.users.find((u) => u.user_id === decoded.user_id);
    if (!user || !user.is_active)
      return res.json({ is_success: false, message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  } catch {
    return res.json({ is_success: false, message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.json({ is_success: false, message: 'Unauthorized for this role' });
    next();
  };
}

module.exports = { authenticate, requireRole };
