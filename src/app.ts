import Koa from 'koa';
import Router from 'koa-router';
import { OrganisationInsertor } from './endpoints/organizations';
import bodyParser from 'koa-bodyparser';
import { pool } from './postgres-setup';
import { getOrganisation } from './endpoints/get-organisation';

export const app = new Koa();

const router = new Router();
app.use(bodyParser());
app.use(router.routes());

router.get('/', async (ctx) => {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM organisations');
  ctx.body = result.rows;
  client.release();
});

router.post('/organisations', async (ctx) => {
  const organisationInsertor = new OrganisationInsertor();
  const result = await organisationInsertor.processOrganizations(ctx);
  ctx.status = result.status;
  ctx.body = result.msg;
});

router.get('/organisations/:orgName', async (ctx) => {
  const result = await getOrganisation(ctx);
  ctx.status = result.status;
  ctx.body = result.body;
});
