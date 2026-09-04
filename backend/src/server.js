import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { parseConversationToProfile } from './services/profileParser.js';
import { matchProfileToSchemes } from './services/eligibilityEngine.js';
import { processDocumentCheck } from './services/ocrService.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db/database.sqlite');
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage() });

// Mount Auth API Routes (/api/auth/*)
app.use('/api/auth', authRoutes);

// Conversational profile parsing endpoint (guest friendly, no auth required)
app.post(['/api/parse-profile', '/api/profile/parse'], (req, res) => {
  try {
    const { messages, currentProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    const updatedProfile = parseConversationToProfile(messages, currentProfile || {});
    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process profile', details: err.message });
  }
});

// If POST /api/profile is called with messages (conversational), handle without auth
app.post('/api/profile', (req, res, next) => {
  if (req.body && req.body.messages && Array.isArray(req.body.messages)) {
    try {
      const { messages, currentProfile } = req.body;
      const updatedProfile = parseConversationToProfile(messages, currentProfile || {});
      return res.json({
        success: true,
        profile: updatedProfile
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to process profile', details: err.message });
    }
  }
  next();
});

// Mount Profile API Routes (/api/profile/*) for authenticated user profile management
app.use('/api/profile', profileRoutes);

import { getDb } from './db/getDb.js';

// 1. GET /api/schemes - Fetch seeded database schemes
app.get('/api/schemes', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM schemes WHERE is_active = 1`, [], (err, schemes) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    db.all(`SELECT * FROM required_documents`, [], (errDocs, docs) => {
      db.all(`SELECT * FROM eligibility_rules`, [], (errRules, rules) => {
        db.close();

        const fullSchemes = schemes.map(scheme => ({
          ...scheme,
          rules: rules.filter(r => r.scheme_id === scheme.id),
          documents: docs.filter(d => d.scheme_id === scheme.id)
        }));

        res.json({
          count: fullSchemes.length,
          schemes: fullSchemes
        });
      });
    });
  });
});

// 2. POST /api/parse-profile - Extract structured profile JSON from text/voice conversation
app.post('/api/parse-profile', (req, res) => {
  try {
    const { messages, currentProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const updatedProfile = parseConversationToProfile(messages, currentProfile || {});
    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process profile', details: err.message });
  }
});

// 3. POST /api/match - Grounded eligibility evaluation against stored rules
app.post('/api/match', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Profile object is required' });
    }

    const matchedSchemes = await matchProfileToSchemes(profile);
    const eligibleCount = matchedSchemes.filter(s => s.status === 'ELIGIBLE').length;

    res.json({
      success: true,
      totalMatched: matchedSchemes.length,
      eligibleCount,
      profile,
      schemes: matchedSchemes
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to match schemes', details: err.message });
  }
});

// 4. POST /api/document-check - Document upload OCR & quality analysis
app.post('/api/document-check', upload.single('document'), async (req, res) => {
  try {
    let fileBuffer;
    let mimeType = 'image/jpeg';
    let originalName = 'uploaded_doc.jpg';

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      originalName = req.file.originalname;
    } else if (req.body.fileBase64) {
      const base64Data = req.body.fileBase64.replace(/^data:image\/\w+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
      if (req.body.docType) originalName = req.body.docType + '.jpg';
    } else {
      return res.status(400).json({ error: 'Document file or fileBase64 is required' });
    }

    const result = await processDocumentCheck(fileBuffer, mimeType, originalName);

    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check document', details: err.message });
  }
});

// Serve frontend dist static files in production
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Jan Suvidha AI Server running on http://localhost:${PORT}`);
  });
}

export default app;
