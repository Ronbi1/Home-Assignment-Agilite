import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const isRemote = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isRemote && { ssl: { rejectUnauthorized: false } }),
});

const sql = readFileSync(join(__dirname, 'init.sql'), 'utf8');

try {
  await pool.query(sql);
  console.log('✓ Database initialized successfully');
} catch (err) {
  console.error('✗ Failed to initialize database:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
