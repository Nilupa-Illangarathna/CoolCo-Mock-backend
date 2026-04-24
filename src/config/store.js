/**
 * In-memory store — acts as the database for the CoolCo dummy backend.
 * Seeded on startup, persists only while the server runs.
 */
const store = {
  users: [],      // { user_id, email, name, phone, password, role, is_active }
  pins: [],       // { user_id, pin_hash }
  sessions: [],   // active JWT tokens
  emailOtps: [],  // { email, otp, user_id, expires_at }  — signup verification
  resetOtps: [],  // { email, otp, expires_at }            — password reset
};

module.exports = store;
