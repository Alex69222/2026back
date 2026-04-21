import { blogsRepository } from "../repositories/blogs-repository";
import { IBlogModel, ICreateBlogModel } from "../types/blog-model";
import { IPaginationModel } from "../types/pagination/pagination-model";
import { paginateItems } from "../utils/paginateItems";
import { INormalizedQparams } from "../utils/qpNormalizer";

export const blogsService = {
  async getBlogs(
    qp: INormalizedQparams,
  ): Promise<IPaginationModel<IBlogModel>> {
    const filter = qp.searchNameTerm ? { name: qp.searchNameTerm } : undefined;
    const totalCount = await blogsRepository.getBlogsCount(filter);
    const items = await blogsRepository.getBlogs(qp);

    const result: IPaginationModel<IBlogModel> = paginateItems({
      items,
      page: qp.pageNumber,
      pageSize: qp.pageSize,
      totalCount,
    });
    return result;
  },

  async getBlogById(id: string): Promise<IBlogModel | null> {
    const blog = await blogsRepository.getBlogById(id);
    return blog;
  },

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
