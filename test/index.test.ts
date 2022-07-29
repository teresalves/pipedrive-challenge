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

describe('App test', () => {
  test('Should request base route with success', async () => {
    const client = await pool.connect();
    (client.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ org_name: 'example' }],
    });
    const result = await request.get('/');
    expect(result.status).toBe(200);
    expect(result.body).toStrictEqual([{ org_name: 'example' }]);
  });
});
