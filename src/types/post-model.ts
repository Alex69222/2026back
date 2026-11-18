export interface PostModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string; // $date-time
}
export class PostModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string, // $date-time
  ) {}
}

export interface ICreatePostModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
