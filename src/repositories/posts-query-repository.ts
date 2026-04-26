import { IPaginationModel } from "../types/pagination/pagination-model";
import { IPostModel } from "../types/post-model";
import { paginateItems } from "../utils/paginateItems";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { postsCollection } from "./db";

export const postsQueryRepository = {
  async getPostsCount(
    filter?: Record<string, string | number>,
  ): Promise<number> {
    const queryFilter = filter || {};

    const postsCount = await postsCollection.countDocuments(queryFilter);

    return postsCount;
  },
  async getPosts(
    qp: INormalizedQparams,
    filter?: Record<string, string | number>,
  ): Promise<IPaginationModel<IPostModel>> {
    const queryFilter = filter || {};
    const totalCount = await this.getPostsCount(filter);
    const posts = await postsCollection
      .find(queryFilter, { projection: { _id: 0 } })
      .limit(qp.pageSize)
      .skip((qp.pageNumber - 1) * qp.pageSize)
      .sort({ [qp.sortBy]: qp.sortDirection })
      .toArray();

    const result: IPaginationModel<IPostModel> = paginateItems({
      items: posts,
      page: qp.pageNumber,
      pageSize: qp.pageSize,
      totalCount,
    });
    return result;
  },

  async getPostById(id: string): Promise<IPostModel | null> {
    const post = await postsCollection.findOne(
      { id },
      { projection: { _id: 0 } },
    );
    return post;
  },
};
