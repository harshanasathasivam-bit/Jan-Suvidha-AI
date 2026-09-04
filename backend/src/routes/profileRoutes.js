import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, getUserById } from '../services/authService.js';
import { matchProfileToSchemes } from '../services/eligibilityEngine.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/database.sqlite');

function getDb() {
  return new sqlite3.Database(dbPath);
}

// Middleware: Verify JWT Authorization header
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Login token required.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }

  req.userId = decoded.id;
  next();
}

// 1. GET /api/profile — Fetch saved user profile
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  db.get(`SELECT * FROM profiles WHERE user_id = ?`, [req.userId], (err, profileRow) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Database error fetching profile', details: err.message });
    }

    res.json({
      success: true,
      hasProfile: !!profileRow,
      profile: profileRow || null
    });
  });
});

// 2. POST /api/profile — Create or update user profile, set profile_completed = 1, return matches
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      full_name,
      age,
      gender,
      mobile_number,
      district,
      education_level,
      school_type_6_to_12,
      education_course_type,
      last_exam_marks_pct,
      annual_family_income,
      ration_card_head,
      ration_card_holder,
      category,
      disability_status
    } = req.body;

    // Required fields validation
    if (!full_name || !age || !gender || !district || !annual_family_income) {
      return res.status(400).json({ error: 'Full name, age, gender, district, and annual family income are required.' });
    }

    const db = getDb();
    const userId = req.userId;

    // Check if profile exists
    db.get(`SELECT id FROM profiles WHERE user_id = ?`, [userId], async (err, existing) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database query error', details: err.message });
      }

      const isHead = ration_card_head ? 1 : 0;
      const isHolder = ration_card_holder !== undefined ? (ration_card_holder ? 1 : 0) : 1;
      const isDisabled = disability_status ? 1 : 0;

      if (existing) {
        // UPDATE profile
        db.run(
          `UPDATE profiles SET 
            full_name = ?, age = ?, gender = ?, mobile_number = ?, district = ?, 
            education_level = ?, school_type_6_to_12 = ?, education_course_type = ?, 
            last_exam_marks_pct = ?, annual_family_income = ?, ration_card_head = ?, 
            ration_card_holder = ?, category = ?, disability_status = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`,
          [
            full_name, Number(age), gender, mobile_number || '', district,
            education_level || '12th_pass', school_type_6_to_12 || 'tn_govt_school', education_course_type || 'regular_higher_education',
            Number(last_exam_marks_pct) || 60, Number(annual_family_income), isHead,
            isHolder, category || 'General', isDisabled, userId
          ],
          async (uErr) => {
            if (uErr) {
              db.close();
              return res.status(500).json({ error: 'Failed to update profile', details: uErr.message });
            }
            await finalizeProfile(db, userId, req.body, res);
          }
        );
      } else {
        // INSERT profile
        db.run(
          `INSERT INTO profiles (
            user_id, full_name, age, gender, mobile_number, district, 
            education_level, school_type_6_to_12, education_course_type, 
            last_exam_marks_pct, annual_family_income, ration_card_head, 
            ration_card_holder, category, disability_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, full_name, Number(age), gender, mobile_number || '', district,
            education_level || '12th_pass', school_type_6_to_12 || 'tn_govt_school', education_course_type || 'regular_higher_education',
            Number(last_exam_marks_pct) || 60, Number(annual_family_income), isHead,
            isHolder, category || 'General', isDisabled
          ],
          async (iErr) => {
            if (iErr) {
              db.close();
              return res.status(500).json({ error: 'Failed to insert profile', details: iErr.message });
            }
            await finalizeProfile(db, userId, req.body, res);
          }
        );
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Profile processing error', details: err.message });
  }
});

// Helper: Mark users.profile_completed = 1 and calculate scheme matches
async function finalizeProfile(db, userId, rawBody, res) {
  db.run(`UPDATE users SET profile_completed = 1 WHERE id = ?`, [userId], async (err) => {
    db.close();

    // Map profile to grounded eligibility engine format
    const engineProfile = {
      age: Number(rawBody.age),
      gender: rawBody.gender,
      annual_family_income: Number(rawBody.annual_family_income),
      school_type_6_to_12: rawBody.school_type_6_to_12 || 'tn_govt_school',
      education_course_type: rawBody.education_course_type || 'regular_higher_education',
      education_level: rawBody.education_level || '12th_pass',
      previous_exam_marks_pct: Number(rawBody.last_exam_marks_pct) || 60,
      ration_card_head: rawBody.ration_card_head ? true : false,
      ration_card_holder: rawBody.ration_card_holder !== undefined ? (rawBody.ration_card_holder ? true : false) : true,
      state_domicile: 'tamil_nadu',
      district: rawBody.district
    };

    // Calculate grounded scheme matches
    const schemeMatches = await matchProfileToSchemes(engineProfile);
    const updatedUser = await getUserById(userId);

    res.json({
      success: true,
      message: 'Profile saved successfully!',
      user: updatedUser,
      profile: rawBody,
      schemes: schemeMatches
    });
  });
}

export default router;
