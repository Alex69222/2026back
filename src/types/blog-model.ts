export interface IBlogModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string; // $date-time
}
export interface ICreateBlogModel {
  name: string;
  description: string;
  websiteUrl: string;
}
