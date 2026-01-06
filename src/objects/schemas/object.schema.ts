export class Builder6Object {
  _id?: string;
  projectId?: string | null; // Allow null to match Prisma
  name: string;
  label: string;
  description?: string | null;
  icon?: string | null;
  schema: string; // The YAML content
  owner?: string | null;
  created: Date;
  modified: Date;
}
