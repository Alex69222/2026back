/// <reference types="jest" />

import request from "supertest";
import { ICreateUserModel, IUserViewModel } from "../../src/types/users-model";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import { ITestManagerCreateData } from "./types/manager.types";
import app, { RouterPaths } from "../../src";

export const usersTestManager = {
  async createUser({
    inputData,
    expectedStatusCode = HTTP_STATUSES.CREATED_201,
    authorizationCredentials = "",
  }: ITestManagerCreateData<ICreateUserModel>) {
    const response = await request(app)
      .post(RouterPaths.users)
      .set("Authorization", authorizationCredentials)
      .send(inputData);

    expect(response.status).toBe(expectedStatusCode);

    let createdEntity;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdEntity = response.body as IUserViewModel;
      expect(response.body.login).toBe(inputData.login);
      expect(response.body.email).toBe(inputData.email);
      expect(response.body.id).toEqual(expect.any(String));
    }

    return { response, createdEntity };
  },
};
