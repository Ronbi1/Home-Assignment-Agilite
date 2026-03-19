import dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for tests. Create server/.env.test from .env.test.example.');
}

const workerIdRaw = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || '0';
const workerId = String(workerIdRaw).replace(/[^a-zA-Z0-9_]/g, '_');
const schemaName = `vitest_${workerId}`;
const dbUrl = new URL(process.env.DATABASE_URL);
const existingOptions = dbUrl.searchParams.get('options');
const workerSearchPath = `-c search_path=${schemaName},public`;
const mergedOptions = existingOptions
  ? `${existingOptions} ${workerSearchPath}`
  : workerSearchPath;

dbUrl.searchParams.set('options', mergedOptions);
process.env.DATABASE_URL = dbUrl.toString();
process.env.TEST_DB_SCHEMA = schemaName;
