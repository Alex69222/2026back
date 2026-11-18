import { blogsQueryRepository } from '../repositories/blogs-query-repositiry';
import { postsQueryRepository } from '../repositories/posts-query-repository';
import { postsRepository } from '../repositories/posts-repository';
import { ICreatePostModel, PostModel } from '../types/post-model';

export const postsService = {
  async addPost(postInputModel: ICreatePostModel): Promise<string | false> {
    const blog = await blogsQueryRepository.getBlogById(postInputModel.blogId);
    if (!blog) return false;

    const post = new PostModel(
      '',
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      postInputModel.blogId,
      blog.name,
      new Date().toISOString(),
    );

    const addedPostId = await postsRepository.addPost(post);

    return addedPostId;
  },

  async updatePost(id: string, postInputModel: ICreatePostModel): Promise<boolean> {
    const post = await postsQueryRepository.getPostById(id);
    if (!post) return false;
    let blogName = post.blogName;
    if (post.blogId !== postInputModel.blogId) {
      const blog = await blogsQueryRepository.getBlogById(postInputModel.blogId);
      if (!blog) return false;
      blogName = blog.name;
    }
    const updated = await postsRepository.updatePost(id, postInputModel, blogName);
    return updated;
  },

  async deletePostById(id: string): Promise<boolean> {
    const result = await postsRepository.deletePostById(id);
    return result;
  },
};
