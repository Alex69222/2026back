import { blogsQueryRepository } from "../repositories/blogs-query-repositiry";
import { postsQueryRepository } from "../repositories/posts-query-repository";
import { postsRepository } from "../repositories/posts-repository";
import { ICreatePostModel, IPostModel } from "../types/post-model";

export const postsService = {
  async addPost(postInputModel: ICreatePostModel): Promise<IPostModel | false> {
    const blog = await blogsQueryRepository.getBlogById(postInputModel.blogId);
    if (!blog) return false;

    const post: IPostModel = {
      ...postInputModel,
      id: new Date().toISOString(),
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };

    const addedPost = await postsRepository.addPost(post);
    const tempPost = addedPost as any;
    delete tempPost._id;
    return tempPost;
  },

  async updatePost(
    id: string,
    postInputModel: ICreatePostModel,
  ): Promise<boolean> {
    const post = await postsQueryRepository.getPostById(id);
    if (!post) return false;
    let blogName = post.blogName;
    if (post.blogId !== postInputModel.blogId) {
      const blog = await blogsQueryRepository.getBlogById(
        postInputModel.blogId,
      );
      if (!blog) return false;
      blogName = blog.name;
    }
    const updated = await postsRepository.updatePost(
      id,
      postInputModel,
      blogName,
    );
    return updated;
  },

  async deletePostById(id: string): Promise<boolean> {
    const result = await postsRepository.deletePostById(id);
    return result;
  },
};
