export interface IPostModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}

export interface ICreatePostModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
