export interface IPostModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string; // $date-time
}

export interface ICreatePostModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
