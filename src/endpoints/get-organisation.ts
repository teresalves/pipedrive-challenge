import { ParameterizedContext } from 'koa';
import { client } from '../postgres-setup';

export async function getOrganisation(ctx: ParameterizedContext) {
  console.log(ctx.params.orgName);
  const name = ctx.params.orgName;
  const parents = await client.query(
      'SELECT parent FROM organisations_relations WHERE daughter=$1;',
      [name],
    );
  console.log(parents.rows);
  let parentQuery = "";
  parents.rows.forEach(async (obj) => {
    parentQuery = parentQuery + `parent='${obj.parent}' OR `;
  })
  if (parentQuery !== "") {
    parentQuery = parentQuery.substring(0, parentQuery.length - 4)
  }
  const sisters = await client.query(`SELECT distinct daughter as sister FROM organisations_relations WHERE ${parentQuery};`);
  const daughters = await client.query("SELECT daughter FROM organisations_relations WHERE parent=$1;", [name],);
  const result = fabricateResponse(parents.rows as [Parent], sisters.rows as [Sister], daughters.rows as [Daughter]);
  return {body: result, status: 200};
}

function fabricateResponse(parents: [Parent], sisters: [Sister], daughters: [Daughter]) {
  let finalResult: [Relationship?] = [];
  console.log("PARENT");
  addToFinalResult(parents, "parent", finalResult);
  console.log("SISTER");
  addToFinalResult(sisters, "sister", finalResult);
  console.log("DAUGHTER");
  addToFinalResult(daughters, "daughter", finalResult);
  console.log(finalResult);
  return finalResult;
}

function addToFinalResult<T>(relatives: [T], relationship: string, finalResult: [Relationship?]) {
  for(const relative of relatives) {
    console.log("Relative", relative);
    finalResult.push({org_name: relative[`${relationship}`], relationship_type: relationship})
  }
}

type Relationship = {
  org_name: string,
  relationship_type: string
}

type Parent = {
  parent: string
}

type Daughter = {
  daughter: string
}

type Sister = {
  sister: string
}