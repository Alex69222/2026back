/// <reference types="jest" />
import request from "supertest";

import { MongoMemoryServer } from "mongodb-memory-server";
import { runDB, stopDB } from "../../src/repositories/db";
import app, { RouterPaths } from "../../src";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";
import { ICreateUserModel, IUserViewModel } from "../../src/types/users-model";
import { usersTestManager } from "../managers/usersTestmanager";

let user: IUserViewModel;

describe("/usersRouter", () => {
  let mongoServer: MongoMemoryServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await runDB(uri);

    await request(app).delete(RouterPaths.test_delete);
  });

  afterAll(async () => {
    await stopDB();
    await mongoServer.stop();
  });

  describe("get", () => {
    it("should not allow to get users without auth", async () => {
      await request(app)
        .get(RouterPaths.users)
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });
    it("should not allow to get users with wrong auth", async () => {
      await request(app)
        .get(RouterPaths.users)
        .set("Authorization", "Wrong credentials")
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("should return 200 and no users", async () => {
      const result = await request(app)
        .get(RouterPaths.users)
        .set("Authorization", validBasicAuthLoginPass);

      expect(result.body.totalCount).toBe(0);
      expect(result.body.items).toEqual([]);
    });
  });

  describe("post", () => {
    const createUserData: ICreateUserModel = {
      login: "login",
      email: "super@gmail.com",
      password: "123456",
    };
    it("should not allow to create user without auth", async () => {
      usersTestManager.createUser({
        inputData: createUserData,
        expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
      });
    });

    it("should not allow to create user with wrong auth", async () => {
      usersTestManager.createUser({
        inputData: createUserData,
        authorizationCredentials: "Wrong credentials",
        expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
      });
    });
    it("should not return 400 when try to create user with incorrect data", async () => {
      usersTestManager.createUser({
        inputData: {
          login: "",
          email: "",
          password: "",
        },
        authorizationCredentials: validBasicAuthLoginPass,
        expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      });

      usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "q".repeat(11),
        },
        authorizationCredentials: validBasicAuthLoginPass,
        expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      });

      usersTestManager.createUser({
        inputData: {
          ...createUserData,
          password: "q".repeat(21),
        },
        authorizationCredentials: validBasicAuthLoginPass,
        expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      });
    });
    it("should create user", async () => {
      const { createdEntity } = await usersTestManager.createUser({
        inputData: createUserData,
        authorizationCredentials: validBasicAuthLoginPass,
      });
      user = createdEntity!;
    });
    it("should return 400 when try to create user with occupied login or email", async () => {
      await usersTestManager.createUser({
        inputData: { ...createUserData, login: "dima" },
        authorizationCredentials: validBasicAuthLoginPass,
        expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      });
      await usersTestManager.createUser({
        inputData: { ...createUserData, email: "mail2@gmail.com" },
        authorizationCredentials: validBasicAuthLoginPass,
        expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      });
    });
  });

  describe("searchLoginTerm", () => {
    it("should return only filtered users", async () => {
      const createUserData: ICreateUserModel = {
        login: "anton",
        email: "anton@gmail.com",
        password: "123456",
      };

      await usersTestManager.createUser({
        inputData: createUserData,
        authorizationCredentials: validBasicAuthLoginPass,
      });
      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "anton2",
          email: "anton2@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });
      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "anton3",
          email: "anton3@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "anton4",
          email: "anton4@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "anton5",
          email: "anton5@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "boris",
          email: "boris@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });
      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "boris2",
          email: "boris2@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "boris3",
          email: "boris3@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "boris4",
          email: "boris4@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      await usersTestManager.createUser({
        inputData: {
          ...createUserData,
          login: "boris5",
          email: "boris5@gmail.com",
        },
        authorizationCredentials: validBasicAuthLoginPass,
      });

      const result = await request(app)
        .get(RouterPaths.users)
        .set("Authorization", validBasicAuthLoginPass);

      expect(result.body.totalCount).toBe(11);
      expect(result.body.items.length).toBe(10);

      const result2 = await request(app)
        .get(RouterPaths.users)
        .query({ searchLoginTerm: "a" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result2.body.totalCount).toBe(5);
      expect(result2.body.items.length).toBe(5);

      const result3 = await request(app)
        .get(RouterPaths.users)
        .query({ searchLoginTerm: "bor" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result3.body.totalCount).toBe(5);
      expect(result3.body.items.length).toBe(5);

      const result4 = await request(app)
        .get(RouterPaths.users)
        .query({ searchEmailTerm: "bor" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result4.body.totalCount).toBe(5);
      expect(result4.body.items.length).toBe(5);

      const result5 = await request(app)
        .get(RouterPaths.users)
        .query({ searchEmailTerm: "an" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result5.body.totalCount).toBe(5);
      expect(result5.body.items.length).toBe(5);

      const result6 = await request(app)
        .get(RouterPaths.users)
        .query({ searchEmailTerm: "su" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result6.body.totalCount).toBe(1);
      expect(result6.body.items.length).toBe(1);
      const result7 = await request(app)
        .get(RouterPaths.users)
        .query({ searchLoginTerm: "lo" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result7.body.totalCount).toBe(1);
      expect(result7.body.items.length).toBe(1);
    });
  });

  describe("delete", () => {
    it("should not allow to delete without auth", async () => {
      await request(app)
        .delete(RouterPaths.users + `/${user.id}`)
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("should return 404 when try to delete not existing user", async () => {
      await request(app)
        .delete(RouterPaths.users + `/notExistingId`)
        .set("Authorization", validBasicAuthLoginPass)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("should  delete user", async () => {
      await request(app)
        .delete(RouterPaths.users + `/${user.id}`)
        .set("Authorization", validBasicAuthLoginPass)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const result = await request(app)
        .get(RouterPaths.users)
        .query({ searchEmailTerm: "su" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result.body.totalCount).toBe(0);
      expect(result.body.items.length).toBe(0);

      const result2 = await request(app)
        .get(RouterPaths.users)
        .query({ searchLoginTerm: "lo" })
        .set("Authorization", validBasicAuthLoginPass);

      expect(result2.body.totalCount).toBe(0);
      expect(result2.body.items.length).toBe(0);
    });
  });
});
