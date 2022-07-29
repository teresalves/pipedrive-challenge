import { ParameterizedContext } from 'koa';
import { pool } from '../postgres-setup';
import { OrganisationsBody, Result } from './types/organisations';

export class OrganisationInsertor {
  operationSuccess: boolean;
  errorMessage: string;
  result: Result;
  client;

  constructor() {
    this.operationSuccess = true;
    this.result;
  }

  async processOrganizations(ctx: ParameterizedContext): Promise<Result> {
    const org: OrganisationsBody = ctx.request.body;

    const result = await this.recursiveOrganisationProcess(org, []);
    return result;
  }

  async recursiveOrganisationProcess(
    baseOrg: OrganisationsBody,
    parents: Array<string>,
  ): Promise<Result> {
    if (!this.operationSuccess) return;

    const client = await pool.connect();
    const result = { status: 200, msg: 'OK' };
    const name = baseOrg.org_name;
    parents.push(name);

    await client.query(
      'INSERT INTO organisations(org_name) VALUES ($1) ON CONFLICT DO NOTHING;',
      [name],
    );
    if (baseOrg.daughters) {
      for (const daughter of Object.values(baseOrg.daughters)) {
        await this.recursiveOrganisationProcess(daughter, parents);
        try {
          await client.query(
            'INSERT INTO organisations_relations(parent, daughter) VALUES ($1,$2);',
            [name, daughter.org_name],
          );
        } catch (err) {
          (result.status = 400),
            (result.msg = `Repeated relations: ${name} and ${daughter.org_name}`);
          this.operationSuccess = false;
          client.release();
          return result;
        }
      }
    }
    client.release();
    return result;
  }

  // TODO: Fix this
  // async wrapInTransaction(queryText, parameters) {
  //   const client = await pool.connect();
  //   const currResult = { status: 200, msg: "OK" };
  //   try {
  //     await client.query('BEGIN')

  //     try {
  //       await client.query(queryText, parameters, function(err, res) {
  //         // console.log("client query result:", res);
  //         if(err) {
  //           //console.log("ERROR");
  //           client.query("ROLLBACK");
  //           // console.log("ROLLED BACK");
  //           // console.log(this.result);
  //           currResult.msg = `Inserted an already existing relation: ${parameters[0]} and ${parameters[1]}`;
  //           currResult.status = 400;
  //           this.operationSuccess = false;
  //         } else {
  //           client.query("COMMIT");
  //           // console.log("COMMITED");
  //         }
  //       });
  //       return currResult;
  //     } catch (err) {
  //       await client.query('ROLLBACK');
  //       console.error('Error committing transaction', err.stack);
  //       return currResult;
  //     }
  //   } finally {
  //     client.release();
  //   }
  // }
}
