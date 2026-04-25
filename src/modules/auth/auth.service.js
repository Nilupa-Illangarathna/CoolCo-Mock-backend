const crypto  = require('crypto');
const store   = require('../../config/store');
const { sign } = require('../../utils/jwt.util');
const { save } = require('../../utils/persist');

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

const findByEmail = (email) =>
  store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

// ── Register ──────────────────────────────────────────────────────────────────

function register(name, email, phone, password) {
  if (findByEmail(email)) {
    return { ok: false, message: 'An account with this email already exists' };
  }

  const user_id = store.users.length
    ? Math.max(...store.users.map((u) => u.user_id)) + 1
    : 1;

  store.users.push({
    user_id,
    email,
    name,
    phone: phone || '',
    password: password,
    role: 'customer',   // self-registered users are customers
    is_active: false,   // inactive until OTP verified
    created_at: new Date().toISOString(),
  });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  store.emailOtps = store.emailOtps.filter((o) => o.email !== email);
  store.emailOtps.push({ email, otp, user_id, expires_at: expires });
  save(store);

  console.log('\n─────────────────────────────────────────');
  console.log(`📧  EMAIL VERIFICATION OTP`);
  console.log(`    Name    : ${name}`);
  console.log(`    Email   : ${email}`);
  console.log(`    OTP     : ${otp}`);
  console.log(`    Expires : ${expires}`);
  console.log('─────────────────────────────────────────\n');

  return { ok: true, message: 'Account created. Check the server console for your OTP.' };
}

// ── Verify Email OTP ──────────────────────────────────────────────────────────

async function verifyEmailOtp(email, otp) {
  const record = store.emailOtps.find(
    (o) => o.email.toLowerCase() === email.toLowerCase()
  );
  if (!record) return { ok: false, message: 'No OTP found for this email' };
  if (new Date(record.expires_at) < new Date())
    return { ok: false, message: 'OTP has expired. Please request a new one.' };
  if (record.otp !== String(otp))
    return { ok: false, message: 'Incorrect OTP' };

  const user = store.users.find((u) => u.user_id === record.user_id);
  if (!user) return { ok: false, message: 'User not found' };

  user.is_active = true;
  store.emailOtps = store.emailOtps.filter((o) => o.email !== email);
  save(store);

  return { ok: true, message: 'Email verified. You can now log in.' };
}

// ── Resend OTP ────────────────────────────────────────────────────────────────

function resendEmailOtp(email) {
  const user = findByEmail(email);
  if (!user) return { ok: false, message: 'No account found with that email' };
  if (user.is_active) return { ok: false, message: 'Account is already verified' };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  store.emailOtps = store.emailOtps.filter((o) => o.email !== email);
  store.emailOtps.push({ email, otp, user_id: user.user_id, expires_at: expires });
  save(store);

  console.log('\n─────────────────────────────────────────');
  console.log(`📧  EMAIL VERIFICATION OTP (RESENT)`);
  console.log(`    Email   : ${email}`);
  console.log(`    OTP     : ${otp}`);
  console.log(`    Expires : ${expires}`);
  console.log('─────────────────────────────────────────\n');

  return { ok: true, message: 'New OTP generated. Check the server console.' };
}

// ── Login ─────────────────────────────────────────────────────────────────────

function login(email, password) {
  const user = findByEmail(email);
  if (!user) return { ok: false, message: 'Invalid email or password' };
  if (!user.is_active)
    return { ok: false, message: 'Account not verified. Please check your OTP.' };

  if (password !== user.password) return { ok: false, message: 'Invalid email or password' };

  const hasPinSet = store.pins.some((p) => p.user_id === user.user_id);
  const token = sign({ user_id: user.user_id, role: user.role, email: user.email });

  return {
    ok: true,
    session_token: token,
    role: user.role,
    name: user.name,
    email: user.email,
    pin_required: hasPinSet,
  };
}

// ── Verify PIN ────────────────────────────────────────────────────────────────

function verifyPin(userId, pin) {
  const record = store.pins.find((p) => p.user_id === userId);
  if (!record) return { ok: false, message: 'PIN not set' };
  if (pin !== record.pin_hash) return { ok: false, message: 'Incorrect PIN' };
  return { ok: true, message: 'PIN verified' };
}

// ── Set PIN ───────────────────────────────────────────────────────────────────

function setPin(userId, pin) {
  if (!/^\d{4,6}$/.test(pin)) return { ok: false, message: 'PIN must be 4–6 digits' };
  const existing = store.pins.findIndex((p) => p.user_id === userId);
  if (existing >= 0) {
    store.pins[existing].pin_hash = pin;
    store.pins[existing].updated_at = new Date().toISOString();
  } else {
    store.pins.push({ user_id: userId, pin_hash: pin, created_at: new Date().toISOString() });
  }
  save(store);
  return { ok: true, message: 'PIN set successfully' };
}

// ── Change Password ───────────────────────────────────────────────────────────

function changePassword(userId, oldPassword, newPassword) {
  const user = store.users.find((u) => u.user_id === userId);
  if (!user) return { ok: false, message: 'User not found' };
  if (oldPassword !== user.password) return { ok: false, message: 'Current password is incorrect' };
  user.password = newPassword;
  save(store);
  return { ok: true, message: 'Password changed successfully' };
}

// ── Get Profile ───────────────────────────────────────────────────────────────

function getProfile(userId) {
  const user = store.users.find((u) => u.user_id === userId);
  if (!user) return null;
  const { password, ...safe } = user;
  const hasPinSet = store.pins.some((p) => p.user_id === userId);
  return { ...safe, pin_set: hasPinSet };
}

// ── Request Password Reset OTP ────────────────────────────────────────────────

function requestReset(email) {
  const user = findByEmail(email);
  if (!user) return { ok: false, message: 'No account found with that email' };
  if (!user.is_active) return { ok: false, message: 'Account is not active' };

  const otp     = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  store.resetOtps = store.resetOtps.filter((o) => o.email !== email);
  store.resetOtps.push({ email, otp, expires_at: expires });
  save(store);

  console.log('\n─────────────────────────────────────────');
  console.log(`🔑  PASSWORD RESET OTP`);
  console.log(`    User     : ${user.email} (${user.name})`);
  console.log(`    OTP      : ${otp}`);
  console.log(`    Expires  : ${expires}`);
  console.log('─────────────────────────────────────────\n');

  return { ok: true, message: 'Reset OTP generated. Check the server console.' };
}

// ── Verify Reset OTP (step 2 — confirm before allowing password change) ───────

function verifyResetOtp(email, otp) {
  const record = store.resetOtps.find(
    (o) => o.email.toLowerCase() === email.toLowerCase()
  );
  if (!record) return { ok: false, message: 'No reset OTP found for this email' };
  if (new Date(record.expires_at) < new Date())
    return { ok: false, message: 'OTP has expired. Please request a new one.' };
  if (record.otp !== String(otp))
    return { ok: false, message: 'Incorrect OTP' };
  return { ok: true, message: 'OTP verified' };
}

// ── Reset Password (step 3 — re-verify OTP + set new password) ───────────────

function resetPassword(email, otp, newPassword) {
  const record = store.resetOtps.find(
    (o) => o.email.toLowerCase() === email.toLowerCase()
  );
  if (!record) return { ok: false, message: 'No reset OTP found for this email' };
  if (new Date(record.expires_at) < new Date())
    return { ok: false, message: 'OTP has expired. Please request a new one.' };
  if (record.otp !== String(otp))
    return { ok: false, message: 'Incorrect OTP' };

  const user = findByEmail(email);
  if (!user) return { ok: false, message: 'User not found' };

  user.password   = newPassword;
  store.resetOtps = store.resetOtps.filter((o) => o.email !== email);
  save(store);
  return { ok: true, message: 'Password reset successfully' };
}

module.exports = {
  register, verifyEmailOtp, resendEmailOtp,
  login, verifyPin, setPin, changePassword, getProfile,
  requestReset, verifyResetOtp, resetPassword,
};
