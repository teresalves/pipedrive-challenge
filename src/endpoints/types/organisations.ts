export type OrganisationsBody = {
  org_name: string;
  daughters?: [OrganisationsBody];
};
