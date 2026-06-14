import { usersQueryRepository } from "../repositories/users-query-repository";
import { usersRepository } from "../repositories/users-repository";
import { IAPIErrorResult } from "../types/error/api-error";
import { ICreateUserModel, IUserBDModel } from "../types/users-model";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { add } from "date-fns/add";
import { emailService } from "../application/email-service";
export const usersService = {
  async createUser(
    userData: ICreateUserModel,
    options: {
      isConfirmed: boolean;
    },
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

    const isConfirmed = options.isConfirmed;
    const emailConfirmation: IUserBDModel["emailConfirmation"] = {
      isConfirmed,
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 1,
      }),
    };

    const user: IUserBDModel = {
      ...userData,
      id: "",
      passwordSalt,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation,
    };
    const userId = await usersRepository.createUser(user);

    if (!isConfirmed) {
      try {
        await emailService.sendConfirmEmailForRegistration(
          user.login,
          user.email,
          emailConfirmation.confirmationCode,
        );
        return [true, userId];
      } catch (e) {
        await usersRepository.deleteUserById(userId);
        return [
          false,
          {
            errorsMessages: [
              {
                field: null,
                message:
                  "something went wrong when trying to send confirmation email. Please, try to register again later",
              },
            ],
          },
        ];
      }
    }

    return [true, userId];
  },

  async deleteUserById(id: string) {
    const deleted = await usersRepository.deleteUserById(id);
    return deleted;
  },
  async getUserById(id: string): Promise<IUserBDModel | null> {
    const user = await usersRepository.getUserById(id);

    return user;
  },
  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<false | IUserBDModel> {
    const user = await usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    if (!user.emailConfirmation.isConfirmed) return false;
    const tryHash = await this._generateHash(password, user.passwordSalt);
    if (tryHash !== user.passwordHash) return false;
    return user;
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
  async confirmEmail(code: string): Promise<[true] | [false, IAPIErrorResult]> {
    const user = await usersRepository.findUserByConfirmationCode(code);
    if (!user) {
      return [
        false,
        {
          errorsMessages: [
            { field: "email", message: "User with this email doesn't exist" },
          ],
        },
      ];
    }
    if (user.emailConfirmation.isConfirmed) {
      return [
        false,
        {
          errorsMessages: [
            { field: null, message: "Email is alredy confirmed" },
          ],
        },
      ];
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      return [
        false,
        {
          errorsMessages: [
            { field: code, message: "The provided code is wrong" },
          ],
        },
      ];
    }
    if (user.emailConfirmation.expirationDate < new Date()) {
      return [
        false,
        {
          errorsMessages: [
            { field: null, message: "Confirmation code is expired" },
          ],
        },
      ];
    }
    let result = await usersRepository.updateConfirmation(user.id);
    return result
      ? [true]
      : [
          false,
          {
            errorsMessages: [
              {
                field: null,
                message:
                  "Confirmation failed. Something went wron. Try again later",
              },
            ],
          },
        ];
  },
  async resendConfirmationEmail(
    email: string,
  ): Promise<[true] | [false, IAPIErrorResult]> {
    const user = await usersRepository.findUserByLoginOrEmail(email);
    if (!user)
      return [
        false,
        {
          errorsMessages: [
            { field: "email", message: "User with this email doesn't exist" },
          ],
        },
      ];
    if (!user.emailConfirmation.isConfirmed)
      return [
        false,
        {
          errorsMessages: [
            { field: null, message: "Email is alredy confirmed" },
          ],
        },
      ];
    const code = uuidv4();

    try {
      await emailService.sendConfirmEmailForRegistration(
        user.login,
        user.email,
        code,
      );
      await usersRepository.updateConfirmationCode(user.id, code);
      return [true];
    } catch (e) {
      return [
        false,
        {
          errorsMessages: [
            {
              field: null,
              message:
                "something went wrong when trying to send confirmation email. Please, try to register again later",
            },
          ],
        },
      ];
    }
  },
};
