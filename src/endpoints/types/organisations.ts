export type OrganisationsBody = {
  org_name: string;
  daughters?: [OrganisationsBody];
};

export type Result = {
  status: number;
  msg: string;
};
