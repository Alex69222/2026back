import { usersCollection } from "./db";
import { IUserDBModel } from "../types/users-model";
import { ObjectId } from "mongodb";

export const usersRepository = {
  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<IUserDBModel | null> {
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
  ): Promise<IUserDBModel | null> {
    const user = await usersCollection.findOne(filter, {
      projection: { _id: 0 },
    });
    if (!user) return null;
    return user;
  },
  async createUser(userData: IUserDBModel) {
    const user = {
      ...userData,
      id: new ObjectId().toString(),
    };

    await usersCollection.insertOne(user);
    return user.id;
  },

  async getUserById(id: string): Promise<IUserDBModel | null> {
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
  async findUserByConfirmationCode(code: string): Promise<IUserDBModel | null> {
    const user = await usersCollection.findOne(
      {
        "emailConfirmation.confirmationCode": code,
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
