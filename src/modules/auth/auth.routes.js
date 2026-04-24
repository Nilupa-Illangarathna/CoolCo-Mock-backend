const router = require('express').Router();
const ctrl = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Public — no auth required
router.post('/register',          ctrl.register);
router.post('/verify_email_otp',  ctrl.verifyEmailOtp);
router.post('/resend_email_otp',  ctrl.resendEmailOtp);
router.post('/login',             ctrl.login);
router.post('/request_reset',     ctrl.requestReset);
router.post('/verify_reset_otp',  ctrl.verifyResetOtp);
router.post('/reset_password',    ctrl.resetPassword);

// Protected — requires valid JWT
router.post('/verify_pin',       authenticate, ctrl.verifyPin);
router.post('/set_pin',          authenticate, ctrl.setPin);
router.post('/change_password',  authenticate, ctrl.changePassword);
router.get('/profile',           authenticate, ctrl.getProfile);

module.exports = router;
