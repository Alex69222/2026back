import { usersCollection } from "./db";
import { IUserBDModel } from "../types/users-model";

export const usersRepository = {
  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<IUserBDModel | null> {
    const user = await usersCollection.findOne(
      {
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      },
      {
        projection: { _id: 0 },
      },
    );
    if (!user) return null;
    return user;
  },
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

  async getUserById(id: string): Promise<IUserBDModel | null> {
    const user = await usersCollection.findOne({ id });
    return user;
  },
  async deleteUserById(id: string): Promise<boolean> {
    const result = await usersCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteUsers(): Promise<boolean> {
    const result = await usersCollection.deleteMany({});
    return result.acknowledged;
  },
  async findUserByConfirmationCode(code: string): Promise<IUserBDModel | null> {
    const user = await usersCollection.findOne(
      {
        "emailConfirmation.con": code,
      },
      {
        projection: { _id: 0 },
      },
    );
    if (!user) return null;
    return user;
  },
  async updateConfirmation(id: string): Promise<boolean> {
    const result = await usersCollection.updateOne(
      { id },
      {
        $set: {
          "emailConfirmation.isConfirmed": true,
        },
      },
    );

    return result.modifiedCount === 1;
  },
  async updateConfirmationCode(id: string, code: string): Promise<boolean> {
    const result = await usersCollection.updateOne(
      { id },
      {
        $set: {
          "emailConfirmation.confirmationCode": code,
        },
      },
    );

    return result.modifiedCount === 1;
  },
};
