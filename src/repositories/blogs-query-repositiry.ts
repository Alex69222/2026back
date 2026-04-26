import { IBlogModel } from "../types/blog-model";
import { IPaginationModel } from "../types/pagination/pagination-model";
import { paginateItems } from "../utils/paginateItems";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { blogsCollection } from "./db";

export const blogsQueryRepository = {
  async getBlogsCount(
    filter?: Record<string, string | number>,
  ): Promise<number> {
    const queryFilter = filter?.name
      ? { name: { $regex: filter.name.toString(), $options: "i" } }
      : {};
    const blogsCount = await blogsCollection.countDocuments(queryFilter);

    return blogsCount;
  },
  async getBlogs(
    qp: INormalizedQparams,
  ): Promise<IPaginationModel<IBlogModel>> {
    const totalCountFilter = qp.searchNameTerm
      ? { name: qp.searchNameTerm }
      : undefined;
    const totalCount = await this.getBlogsCount(totalCountFilter);
    const filter = qp.searchNameTerm
      ? { name: { $regex: qp.searchNameTerm, $options: "i" } }
      : {};
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
