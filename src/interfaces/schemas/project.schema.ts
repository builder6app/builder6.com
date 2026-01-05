export class Project {
  _id?: string;
  name: string;
  description?: string;
  slug?: string;
  homePage?: string;
  displayNavigation?: boolean;
  navigationStyle?: 'top' | 'left';
  themeColor?: string;
  
  // Steedos Standard Fields
  owner?: string;
  created: Date;
  created_by?: string;
  modified: Date;
  modified_by?: string;
}
