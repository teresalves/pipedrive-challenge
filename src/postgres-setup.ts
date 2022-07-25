import { Client } from 'pg';

const clientConfig = {
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'teresalves',
  password: process.env.PGPASSWORD || 'example',
  port: Number(process.env.PGPORT) || 3300,
  database: process.env.PGDATABASE || 'pipedriveDb',
};

export const client = new Client(clientConfig);

export function connectToPg() {
  client.connect().catch((error: any) => {
    // console.log('error connecting')
    // console.log(error);
    throw error;
  });
}
