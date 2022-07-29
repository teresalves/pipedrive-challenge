import { ParameterizedContext } from 'koa';
import { pool } from '../postgres-setup';

export async function getOrganisation(ctx: ParameterizedContext) {
  const client = await pool.connect();
  const name = ctx.params.orgName;
  const existanceCheck = await client.query(
    'SELECT org_name FROM organisations WHERE org_name=$1;',
    [name],
  );
  if (existanceCheck.rows?.length === 0) {
    return { body: 'Organisation does not exist', status: 404 };
  }

  const queryText =
    "SELECT parent as org_name, 'parent' as relationship_type FROM organisations_relations WHERE daughter=$1 \
    union \
    SELECT daughter as org_name, 'daughter' as relationship_type FROM organisations_relations WHERE parent=$1 \
    union \
    SELECT daughter as org_name, 'sister' as relationship_type FROM organisations_relations \
      WHERE daughter <> $1 \
      AND parent IN (SELECT parent FROM organisations_relations WHERE daughter=$1)";
  const result = await client.query(queryText, [name]);
  client.release();

  if (result.rows?.length === 0) {
    return { body: undefined, status: 204 };
  }
  return { body: result.rows, status: 200 };
}
