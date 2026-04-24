const svc = require('./auth.service');

async function register(req, res) {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.json({ is_success: false, message: 'Name, email and password are required' });
  const result = await svc.register(name, email, phone, password);
  res.json({ is_success: result.ok, message: result.message });
}

async function verifyEmailOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.json({ is_success: false, message: 'Email and OTP are required' });
  const result = await svc.verifyEmailOtp(email, otp);
  res.json({ is_success: result.ok, message: result.message });
}

async function resendEmailOtp(req, res) {
  const { email } = req.body;
  if (!email)
    return res.json({ is_success: false, message: 'Email is required' });
  const result = svc.resendEmailOtp(email);
  res.json({ is_success: result.ok, message: result.message });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ is_success: false, message: 'Email and password are required' });
  const result = await svc.login(email, password);
  res.json({ is_success: result.ok, ...result });
}

async function verifyPin(req, res) {
  const { pin } = req.body;
  if (!pin) return res.json({ is_success: false, message: 'PIN is required' });
  const result = await svc.verifyPin(req.user.user_id, pin);
  res.json({ is_success: result.ok, message: result.message });
}

async function setPin(req, res) {
  const { pin } = req.body;
  if (!pin) return res.json({ is_success: false, message: 'PIN is required' });
  const result = await svc.setPin(req.user.user_id, pin);
  res.json({ is_success: result.ok, message: result.message });
}

async function changePassword(req, res) {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password)
    return res.json({ is_success: false, message: 'Both old and new password are required' });
  const result = await svc.changePassword(req.user.user_id, old_password, new_password);
  res.json({ is_success: result.ok, message: result.message });
}

function getProfile(req, res) {
  const profile = svc.getProfile(req.user.user_id);
  if (!profile) return res.json({ is_success: false, message: 'User not found' });
  res.json({ is_success: true, data: profile });
}

async function requestReset(req, res) {
  const { email } = req.body;
  if (!email) return res.json({ is_success: false, message: 'Email is required' });
  const result = svc.requestReset(email);
  res.json({ is_success: result.ok, message: result.message });
}

function verifyResetOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.json({ is_success: false, message: 'Email and OTP are required' });
  const result = svc.verifyResetOtp(email, otp);
  res.json({ is_success: result.ok, message: result.message });
}

async function resetPassword(req, res) {
  const { email, otp, new_password } = req.body;
  if (!email || !otp || !new_password)
    return res.json({ is_success: false, message: 'Email, OTP and new password are required' });
  const result = await svc.resetPassword(email, otp, new_password);
  res.json({ is_success: result.ok, message: result.message });
}

module.exports = {
  register, verifyEmailOtp, resendEmailOtp,
  login, verifyPin, setPin, changePassword, getProfile,
  requestReset, verifyResetOtp, resetPassword,
};
