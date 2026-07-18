import dotenv from 'dotenv';
import path from 'path';

// Loaded as the very first import in index.ts so that env vars are populated
// BEFORE any module that reads them at import time (e.g. db/index.ts calling
// neon(process.env.DATABASE_URL)). ES module imports are hoisted and run in
// order, so a side-effect-only import here guarantees dotenv runs first.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
