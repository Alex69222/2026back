import { blogsRepository } from "../repositories/blogs-repository";
import { IBlogModel, ICreateBlogModel } from "../types/blog-model";

export const blogsService = {
  async addBlog(blogInputModel: ICreateBlogModel): Promise<IBlogModel> {
    const blog: IBlogModel = {
      ...blogInputModel,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const addedBlog = await blogsRepository.addBlog(blog);
    return addedBlog;
  },

  async updateBlog(
    id: string,
    blogInputModel: ICreateBlogModel,
  ): Promise<boolean> {
    const updated = await blogsRepository.updateBlog(id, blogInputModel);

    return updated;
  },

  async deleteBlogById(id: string): Promise<boolean> {
    const result = await blogsRepository.deleteBlogById(id);

    return result;
  },
};
