import { ParameterizedContext } from 'koa';
import { client } from '../postgres-setup';
import { OrganisationsBody } from './types/organisations';

export async function processOrganizations(
  ctx: ParameterizedContext,
): Promise<void> {
  const org: OrganisationsBody = ctx.request.body;
  await recursiveOrganisationProcess(org, []);
  ctx.body = 'OK';
}

async function recursiveOrganisationProcess(
  baseOrg: OrganisationsBody,
  parents: Array<string>,
): Promise<void> {
  const name = (baseOrg.org_name);
  parents.push(name);
  await client.query(
    'INSERT INTO organisations(org_name) VALUES ($1) ON CONFLICT DO NOTHING;',
    [name],
  );
  baseOrg.daughters?.forEach(async (daughter) => {
    if (!(daughter.org_name in parents)) {
      await recursiveOrganisationProcess(daughter, parents); // had to wait because we cant add the relationship before the actual daughter
      await client.query(
        'INSERT INTO organisations_relations(parent, daughter) VALUES ($1,$2) ON CONFLICT DO NOTHING;',
        [name, (daughter.org_name)],
      );
    }
  });
}
