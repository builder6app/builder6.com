export class PageVersion {
  _id?: string;
  pageId: string;
  code: string;
  versionId: string;

  // Steedos Standard Fields
  owner?: string;
  created: Date;
  created_by?: string;
  modified?: Date;
  modified_by?: string;
}
