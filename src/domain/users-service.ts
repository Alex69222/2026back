import { usersQueryRepository } from "../repositories/users-query-repository";
import { usersRepository } from "../repositories/users-repository";
import { IAPIErrorResult } from "../types/error/api-error";
import { ICreateUserModel, IUserBDModel } from "../types/users-model";
import bcrypt from "bcrypt";
export const usersService = {
  async createUser(
    userData: ICreateUserModel,
  ): Promise<[true, string] | [false, IAPIErrorResult]> {
    const userIsUniqueData = await this._validateUserIsUnique(
      userData.login,
      userData.email,
    );
    if (!userIsUniqueData[0]) {
      return userIsUniqueData;
    }
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      userData.password,
      passwordSalt,
    );

    const user: IUserBDModel = {
      ...userData,
      id: "",
      passwordSalt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    const userId = await usersRepository.createUser(user);
    return [true, userId];
  },

  async deleteUserById(id: string) {
    const deleted = await usersRepository.deleteUserById(id);
    return deleted;
  },

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<boolean> {
    const user = await usersRepository.findUserByFilter({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) return false;
    const tryHash = await this._generateHash(password, user.passwordSalt);
    return tryHash === user.passwordHash;
  },

  async _generateHash(password: string, salt: string) {
    const hash = await bcrypt.hash(password, salt);
    return hash;
  },

  async _validateUserIsUnique(
    login: string,
    email: string,
  ): Promise<[true] | [false, IAPIErrorResult]> {
    const userWithLoginExists = await usersQueryRepository.findUserByFilter({
      login,
    });
    if (userWithLoginExists) {
      return [
        false,
        {
          errorsMessages: [
            { field: "login", message: "login should be unique" },
          ],
        },
      ];
    }
    const userWithEmailExists = await usersQueryRepository.findUserByFilter({
      email,
    });
    if (userWithEmailExists) {
      return [
        false,
        {
          errorsMessages: [
            { field: "email", message: "email should be unique" },
          ],
        },
      ];
    }
    return [true];
  },
};
