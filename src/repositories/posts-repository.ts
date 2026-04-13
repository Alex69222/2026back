import { ICreatePostModel, IPostModel } from "../types/post-model";
import { blogsRepository } from "./blogs-repository";

const posts: Array<IPostModel> = [];

export const postsRepository = {
  getPosts() {
    return posts;
  },

  getPostById(id: string) {
    const post = posts.find((v) => v.id === id);
    return post;
  },

  addPost(postInputModel: ICreatePostModel) {
    const blog = blogsRepository.getBlogById(postInputModel.blogId);
    if (!blog) return false;

    const post: IPostModel = {
      ...postInputModel,
      id: new Date().toISOString(),
      blogName: blog.name,
    };

    posts.push(post);
    return post;
  },

  updatePost(id: string, postInputModel: ICreatePostModel) {
    const post = posts.find((p) => p.id === id);
    if (!post) return false;
    let blogName = post.blogName;

    if (post.blogId !== postInputModel.blogId) {
      const blog = blogsRepository.getBlogById(postInputModel.blogId);
      if (!blog) return false;
      blogName = blog.name;
    }
    post.title = postInputModel.title;
    post.blogId = postInputModel.blogId;
    post.blogName = blogName;
    post.content = postInputModel.content;
    post.shortDescription = postInputModel.shortDescription;

    return true;
  },

  deletePostById(id: string) {
    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) return false;
    posts.splice(postIndex, 1);
    return true;
  },

  deletePosts() {
    posts.length = 0;
  },
};
