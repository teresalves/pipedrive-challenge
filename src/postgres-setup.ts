import { Pool } from 'pg';

const clientConfig = {
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'teresalves',
  password: process.env.PGPASSWORD || 'example',
  port: Number(process.env.PGPORT) || 3300,
  database: process.env.PGDATABASE || 'pipedriveDb',
};

export const pool = new Pool(clientConfig);
