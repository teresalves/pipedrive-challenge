import Koa from 'koa';
import Router from 'koa-router';
import { processOrganizations } from './endpoints/organizations';
import bodyParser from 'koa-bodyparser';


export const app = new Koa();

const router = new Router();
app.use(bodyParser());
app.use(router.routes());

router.get('/', (ctx) => {
  ctx.body = 'Hello World';
});

router.post('/organisations', (ctx) => {
  console.log(ctx.request.body);
  processOrganizations(ctx);
});

