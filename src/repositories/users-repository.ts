import { usersCollection } from "./db";
import { IUserBDModel } from "../types/users-model";

export const usersRepository = {
  async findUserByFilter(
    filter: Record<string, any>,
  ): Promise<IUserBDModel | null> {
    const user = await usersCollection.findOne(filter, {
      projection: { _id: 0 },
    });
    if (!user) return null;
    return user;
  },
  async createUser(userData: IUserBDModel) {
    const user = {
      ...userData,
      id: new Date().toISOString(),
    };

    await usersCollection.insertOne(user);
    return user.id;
  },

  async deleteUserById(id: string): Promise<boolean> {
    const result = await usersCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteUsers(): Promise<boolean> {
    const result = await usersCollection.deleteMany({});
    return result.acknowledged;
  },
};
