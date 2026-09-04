import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalDbPath = path.join(__dirname, 'database.sqlite');
let activeDbPath = originalDbPath;

// On Vercel or read-only environments, copy database.sqlite to /tmp/database.sqlite
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const tmpDbPath = '/tmp/database.sqlite';
  try {
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(originalDbPath)) {
        fs.copyFileSync(originalDbPath, tmpDbPath);
      }
    }
    activeDbPath = tmpDbPath;
  } catch (err) {
    console.error('Failed to copy SQLite database to /tmp:', err);
  }
}

export function getDb() {
  return new sqlite3.Database(activeDbPath);
}

export { activeDbPath };
