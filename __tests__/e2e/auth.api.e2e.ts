/// <reference types="jest" />
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { runDB, stopDB } from "../../src/repositories/db";
import app, { RouterPaths } from "../../src";
import { ICreateUserModel, IUserViewModel } from "../../src/types/users-model";
import { usersTestManager } from "../managers/usersTestmanager";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";

const createUserData: ICreateUserModel = {
  login: "Blogger",
  password: "secret_password",
  email: "superblogger@gmail.com",
};

let accessToken: string;

describe("auth", () => {
  let mongoServer: MongoMemoryServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await runDB(uri);

    await request(app).delete(RouterPaths.test_delete);

    await usersTestManager.createUser({
      inputData: createUserData,
      authorizationCredentials: validBasicAuthLoginPass,
    });
  });

  afterAll(async () => {
    await stopDB();
    await mongoServer.stop();
  });

  it("shoud not login with incorrect user data", async () => {
    await request(app)
      .post(RouterPaths.auth + "/login")
      .send()
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });

  it("shoud not login with when user credentials are wrong", async () => {
    await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: "Blogger1",
        password: "123456",
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: "superblogger1@gmail.com",
        password: "123456",
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: createUserData.login,
        password: "123456",
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: createUserData.email,
        password: "123456",
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it("should login with correct credentials", async () => {
    const data = await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: createUserData.email,
        password: createUserData.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(data.body.accessToken).toEqual(expect.any(String));

    const data2 = await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: createUserData.login,
        password: createUserData.password,
      })
      .expect(HTTP_STATUSES.OK_200);
    expect(data2.body.accessToken).toEqual(expect.any(String));

    accessToken = data2.body.accessToken;
  });

  it("401 error when try to get /me as unauthorized user", async () => {
    await request(app)
      .get(RouterPaths.auth + "/me")
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it("get current user info (/me)", async () => {
    const result = await request(app)
      .get(RouterPaths.auth + "/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(result.body.login).toBe(createUserData.login);
    expect(result.body.email).toBe(createUserData.email);
    expect(result.body.login).toEqual(expect.any(String));
  });
});
