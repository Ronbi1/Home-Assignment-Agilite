import { readFileSync } from 'fs';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import pool from '../../src/config/db.js';

const initSql = readFileSync(new URL('../../db/init.sql', import.meta.url), 'utf8');
const schemaName = process.env.TEST_DB_SCHEMA || 'vitest_0';

beforeAll(async () => {
  await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await pool.query(`CREATE SCHEMA "${schemaName}"`);
  await pool.query(initSql);
});

beforeEach(async () => {
  await pool.query('TRUNCATE replies, tickets RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
