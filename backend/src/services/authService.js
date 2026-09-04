import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/database.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'jan_suvidha_secure_jwt_secret_2026_key';

function getDb() {
  return new sqlite3.Database(dbPath);
}

// 1. Hash password
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

// 2. Compare password
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// 3. Generate JWT Token
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 4. Verify JWT Token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// 5. Generate and save 6-digit numeric code with 10-minute expiry
export function createVerificationCode(userId, purpose) {
  const db = getDb();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO verification_codes (user_id, code, purpose, expires_at, used) VALUES (?, ?, ?, ?, 0)`,
      [userId, code, purpose, expiresAt],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID, code, expiresAt });
      }
    );
  });
}

// 6. Verify 6-digit code
export function validateVerificationCode(userId, code, purpose) {
  const db = getDb();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM verification_codes 
       WHERE user_id = ? AND code = ? AND purpose = ? AND used = 0 AND expires_at > ?
       ORDER BY id DESC LIMIT 1`,
      [userId, code, purpose, now],
      (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (!row) {
          db.close();
          return resolve({ valid: false, reason: 'Invalid or expired verification code' });
        }

        // Mark code as used
        db.run(`UPDATE verification_codes SET used = 1 WHERE id = ?`, [row.id], (uErr) => {
          db.close();
          if (uErr) return reject(uErr);
          resolve({ valid: true });
        });
      }
    );
  });
}

// 7. Check 60-second cooldown rate limit for resending code
export function checkResendCooldown(userId, purpose) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT created_at FROM verification_codes 
       WHERE user_id = ? AND purpose = ?
       ORDER BY id DESC LIMIT 1`,
      [userId, purpose],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        if (!row) return resolve({ canResend: true });

        const lastCreated = new Date(row.created_at).getTime();
        const diffSeconds = Math.floor((Date.now() - lastCreated) / 1000);

        if (diffSeconds < 60) {
          return resolve({
            canResend: false,
            waitTime: 60 - diffSeconds
          });
        }

        resolve({ canResend: true });
      }
    );
  });
}

// Helper: Get user by email
export function getUserByEmail(email) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()], (err, row) => {
      db.close();
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Helper: Get user by ID
export function getUserById(id) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, name, email, district, annual_income, is_verified, created_at FROM users WHERE id = ?`, [id], (err, row) => {
      db.close();
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Helper: Create user
export async function createUser({ name, email, password, district, income }) {
  const db = getDb();
  const hashed = await hashPassword(password);
  const cleanEmail = email.toLowerCase().trim();

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email, hashed_password, district, annual_income, is_verified) VALUES (?, ?, ?, ?, ?, 0)`,
      [name, cleanEmail, hashed, district || 'Chennai', Number(income) || 120000],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID, name, email: cleanEmail, is_verified: false });
      }
    );
  });
}

// Helper: Set user verified
export function setUserVerified(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(`UPDATE users SET is_verified = 1 WHERE id = ?`, [userId], (err) => {
      db.close();
      if (err) return reject(err);
      resolve(true);
    });
  });
}
