import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";


export function processOrganizations(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>>) {
    console.log(ctx.request.body);
}