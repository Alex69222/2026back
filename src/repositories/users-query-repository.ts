import { IPaginationModel } from "../types/pagination/pagination-model";
import { IUserViewModel } from "../types/users-model";
import { paginateItems } from "../utils/paginateItems";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { usersCollection } from "./db";

export const usersQueryRepository = {
  async findUserByFilter(
    filter: Record<string, string | number>,
  ): Promise<IUserViewModel | null> {
    const user = await usersCollection.findOne(filter, {
      projection: { _id: 0 },
    });
    if (!user) return null;
    const { id, login, email, createdAt } = user;
    return { id, login, email, createdAt };
  },

  async getUsersCount(filter?: Record<any, any>): Promise<number> {
    const usersCount = await usersCollection.countDocuments(filter);

    return usersCount;
  },
  async getUsers(
    qp: INormalizedQparams,
  ): Promise<IPaginationModel<IUserViewModel>> {
    const filter: Record<string, any> = {};
    if (qp?.searchLoginTerm) {
      filter.login = { $regex: qp.searchLoginTerm.toString(), $options: "i" };
    }
    if (qp?.searchEmailTerm) {
      filter.email = { $regex: qp.searchEmailTerm.toString(), $options: "i" };
    }

    const totalCount = await this.getUsersCount(filter);

    const blogs = await usersCollection
      .find(filter, { projection: { _id: 0 } })
      .limit(qp.pageSize)
      .skip((qp.pageNumber - 1) * qp.pageSize)
      .sort({ [qp.sortBy]: qp.sortDirection })
      .toArray();
    const result: IPaginationModel<IUserViewModel> = paginateItems({
      items: blogs,
      page: qp.pageNumber,
      pageSize: qp.pageSize,
      totalCount,
    });
    return result;
  },
};
