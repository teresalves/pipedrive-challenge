import { pool } from '../src/postgres-setup';
import { request } from './utils';

jest.mock('../src/postgres-setup.ts', () => ({
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    }),
  },
}));

const orgValidatorResponse = {
  rows: [
    {
      org_name: 'Paradise Island',
    },
  ],
};

const queryResponse = {
  rows: [
    {
      org_name: 'Banana Tree',
      relatioship_type: 'daughter',
    },
    {
      org_name: 'Big Banana Tree',
      relationship_type: 'daughter',
    },
  ],
};

describe('get-organisation', () => {
  test.only('should get organization responses for an existing org', async () => {
    const client = await pool.connect();
    (client.query as jest.Mock).mockResolvedValueOnce(orgValidatorResponse);
    (client.query as jest.Mock).mockResolvedValueOnce(queryResponse);
    const result = await request.get('/organisations/Paradise Island');
    expect(result.status).toBe(200);
    expect(JSON.stringify(result.body)).toMatch(
      JSON.stringify(queryResponse.rows),
    );
  });

  test('should not get organization responses for a non existing org', async () => {
    const client = await pool.connect();
    (client.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    (client.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const result = await request.get('/organisations/Paradise Island');
    expect(result.status).toBe(404);
    // expect(result.body).toMatch("Organisation does not exist")
  });

  test('should not get organization responses for an org without relatives', async () => {
    const client = await pool.connect();
    (client.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ org_name: 'Paradise Island' }],
    });
    (client.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const result = await request.get('/organisations/Paradise Island');
    expect(result.status).toBe(204);
    // expect(result.body).toBeUndefined();
  });
});
