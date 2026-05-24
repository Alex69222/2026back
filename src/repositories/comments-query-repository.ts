import { ICommentViewModel } from "../types/comment-model";
import { IPaginationModel } from "../types/pagination/pagination-model";
import { paginateItems } from "../utils/paginateItems";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { commentsCollection } from "./db";

export const commentsQueryRepository = {
  async getCommentById(id: string): Promise<ICommentViewModel | null> {
    const comment = await commentsCollection.findOne(
      { id },
      { projection: { _id: 0, postId: 0 } },
    );
    return comment;
  },
  async getCommentsByPostId(
    id: string,
    qp: INormalizedQparams,
  ): Promise<IPaginationModel<ICommentViewModel>> {
    const filter = { postId: id };
    const totalCount = await commentsCollection.countDocuments(filter);
    const comments = await commentsCollection
      .find(filter, { projection: { _id: 0 } })
      .limit(qp.pageSize)
      .skip((qp.pageNumber - 1) * qp.pageSize)
      .sort({ [qp.sortBy]: qp.sortDirection })
      .toArray();
    const result: IPaginationModel<ICommentViewModel> = paginateItems({
      items: comments,
      page: qp.pageNumber,
      pageSize: qp.pageSize,
      totalCount,
    });
    return result;
  },
};
