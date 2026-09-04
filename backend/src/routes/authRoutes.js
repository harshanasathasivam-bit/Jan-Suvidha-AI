import express from 'express';
import { 
  createUser, 
  getUserByEmail, 
  getUserById, 
  comparePassword, 
  createVerificationCode, 
  validateVerificationCode, 
  checkResendCooldown, 
  setUserVerified, 
  generateToken, 
  verifyToken 
} from '../services/authService.js';
import { sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, district, income } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create unverified user
    const user = await createUser({ name, email, password, district, income });

    // Generate 6-digit registration code
    const { code } = await createVerificationCode(user.id, 'register');

    // Send email
    const emailResult = await sendVerificationEmail({
      toEmail: user.email,
      userName: user.name,
      code,
      purpose: 'register'
    });

    res.json({
      success: true,
      message: 'Registration successful. Verification code sent to email.',
      userId: user.id,
      email: user.email,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      // If email key is missing, return code in dev notice so prompt requirements are fully met
      devNotice: !emailResult.success ? `Verification code: ${code} (Configure RESEND_API_KEY for live inbox delivery)` : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// 2. POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valResult = await validateVerificationCode(user.id, code.trim(), 'register');
    if (!valResult.valid) {
      return res.status(400).json({ error: valResult.reason });
    }

    // Mark user verified
    await setUserVerified(user.id);
    const updatedUser = await getUserById(user.id);
    const token = generateToken(updatedUser);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Email verification failed', details: err.message });
  }
});

// 3. POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const codePurpose = purpose || (user.is_verified ? 'login' : 'register');

    // 60-second cooldown check
    const cooldown = await checkResendCooldown(user.id, codePurpose);
    if (!cooldown.canResend) {
      return res.status(429).json({
        error: `Please wait ${cooldown.waitTime} seconds before requesting a new code.`
      });
    }

    const { code } = await createVerificationCode(user.id, codePurpose);
    const emailResult = await sendVerificationEmail({
      toEmail: user.email,
      userName: user.name,
      code,
      purpose: codePurpose
    });

    res.json({
      success: true,
      message: 'Fresh 6-digit verification code sent to your email.',
      emailSent: emailResult.success,
      devNotice: !emailResult.success ? `Verification code: ${code}` : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend code', details: err.message });
  }
});

// 4. POST /api/auth/login — Checks password, dispatches 6-digit login verification code by email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify bcrypt password hash
    const passwordMatch = await comparePassword(password, user.hashed_password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password alone is NEVER enough to log in — generate fresh 6-digit login code
    const { code } = await createVerificationCode(user.id, 'login');
    const emailResult = await sendVerificationEmail({
      toEmail: user.email,
      userName: user.name,
      code,
      purpose: 'login'
    });

    res.json({
      success: true,
      requiresLoginVerification: true,
      message: 'Password correct. 6-digit login verification code sent to your email.',
      userId: user.id,
      email: user.email,
      emailSent: emailResult.success,
      devNotice: !emailResult.success ? `Login verification code: ${code}` : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// 5. POST /api/auth/verify-login — Validates 6-digit login code and returns JWT session token
router.post('/verify-login', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and login verification code are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valResult = await validateVerificationCode(user.id, code.trim(), 'login');
    if (!valResult.valid) {
      return res.status(400).json({ error: valResult.reason });
    }

    // Issue JWT session token
    const token = generateToken(user);
    const userInfo = await getUserById(user.id);

    res.json({
      success: true,
      message: 'Login verification successful!',
      token,
      user: userInfo
    });
  } catch (err) {
    res.status(500).json({ error: 'Login verification failed', details: err.message });
  }
});

// 6. GET /api/auth/me — Protected route returning logged-in user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

export default router;
