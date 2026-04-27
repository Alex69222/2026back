import { IBlogModel } from "../types/blog-model";
import { IPaginationModel } from "../types/pagination/pagination-model";
import { paginateItems } from "../utils/paginateItems";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { blogsCollection } from "./db";

export const blogsQueryRepository = {
  async getBlogsCount(filter?: Record<any, any>): Promise<number> {
    const blogsCount = await blogsCollection.countDocuments(filter);

    return blogsCount;
  },
  async getBlogs(
    qp: INormalizedQparams,
  ): Promise<IPaginationModel<IBlogModel>> {
    const filter = qp.searchNameTerm
      ? { name: { $regex: qp.searchNameTerm, $options: "i" } }
      : {};

    const totalCount = await this.getBlogsCount(filter);

    const blogs = await blogsCollection
      .find(filter, { projection: { _id: 0 } })
      .limit(qp.pageSize)
      .skip((qp.pageNumber - 1) * qp.pageSize)
      .sort({ [qp.sortBy]: qp.sortDirection })
      .toArray();
    const result: IPaginationModel<IBlogModel> = paginateItems({
      items: blogs,
      page: qp.pageNumber,
      pageSize: qp.pageSize,
      totalCount,
    });
    return result;
  },

  async getBlogById(id: string): Promise<IBlogModel | null> {
    const blog = await blogsCollection.findOne(
      { id },
      { projection: { _id: 0 } },
    );
    return blog;
  },
};
