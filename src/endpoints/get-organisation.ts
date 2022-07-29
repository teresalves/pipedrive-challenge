import { ParameterizedContext } from 'koa';
import { pool } from '../postgres-setup';
import { Result } from './types/organisations';

export async function getOrganisation(
  ctx: ParameterizedContext,
): Promise<Result> {
  const client = await pool.connect();
  const name = ctx.params.orgName;
  const offset = Number(ctx.query.offset) || 0;
  const existanceCheck = await client.query(
    'SELECT org_name FROM organisations WHERE org_name=$1;',
    [name],
  );
  if (existanceCheck.rows?.length === 0) {
    return { msg: 'Organisation does not exist', status: 404 };
  }
  // Union of three queries
  // First the parents, second the daughters, third the sisters by seeing all the daughters with common parents
  const queryText =
    "SELECT parent as org_name, 'parent' as relationship_type FROM organisations_relations WHERE daughter=$1 \
    union \
    SELECT daughter as org_name, 'daughter' as relationship_type FROM organisations_relations WHERE parent=$1 \
    union \
    SELECT daughter as org_name, 'sister' as relationship_type FROM organisations_relations \
      WHERE daughter <> $1 \
      AND parent IN (SELECT parent FROM organisations_relations WHERE daughter=$1) \
    ORDER BY org_name \
    LIMIT 100 \
    OFFSET $2";
  const result = await client.query(queryText, [name, offset]);
  client.release();

  if (result.rows?.length === 0) {
    // Has no parent, sister or daughter -> isolated org
    return { msg: undefined, status: 204 };
  }
  return { msg: result.rows, status: 200 };
}
