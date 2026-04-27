/// <reference types="jest" />

import request from "supertest";
import { IBlogModel, ICreateBlogModel } from "../../src/types/blog-model";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import { app, RouterPaths } from "../../src";
import { ITestManagerCreateData } from "./types/manager.types";

export const blogsTestManager = {
  async createBlog({
    inputData,
    expectedStatusCode = HTTP_STATUSES.CREATED_201,
    authorizationCredentials = "",
  }: ITestManagerCreateData<ICreateBlogModel>) {
    const response = await request(app)
      .post(RouterPaths.blogs)
      .set("Authorization", authorizationCredentials)
      .send(inputData);

    expect(response.status).toBe(expectedStatusCode);

    let createdEntity;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdEntity = response.body as IBlogModel;
      expect(response.body.name).toBe(inputData.name);
      expect(response.body.id).toEqual(expect.any(String));
    }

    return { response, createdEntity };
  },
};
