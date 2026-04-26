import { blogsRepository } from "../repositories/blogs-repository";
import { IBlogModel, ICreateBlogModel } from "../types/blog-model";

export const blogsService = {
  async addBlog(blogInputModel: ICreateBlogModel): Promise<string> {
    const blog: IBlogModel = {
      ...blogInputModel,
      createdAt: new Date().toISOString(),
      isMembership: false,
      id: "",
    };

    const addedBlogId = await blogsRepository.addBlog(blog);
    return addedBlogId;
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
