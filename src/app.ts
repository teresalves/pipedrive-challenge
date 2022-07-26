import Koa from 'koa';
import Router from 'koa-router';
import { processOrganizations } from './endpoints/organizations';
import bodyParser from 'koa-bodyparser';
import { client, connectToPg } from './postgres-setup';
import { getOrganisation } from './endpoints/get-organisation';

export const app = new Koa();

const router = new Router();
app.use(bodyParser());
app.use(router.routes());
connectToPg();

router.get('/', async (ctx) => {
  const result = await client.query('SELECT * FROM organisations');
  ctx.body = result.rows;
});

router.post('/organisations', (ctx) => {
  processOrganizations(ctx);
});

router.get('/organisations/:orgName', async (ctx) => {
  const result = await getOrganisation(ctx);
  ctx.body = result.body;
  ctx.status = result.status;
});