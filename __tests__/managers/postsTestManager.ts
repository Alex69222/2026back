import request from "supertest";
import { ICreatePostModel, IPostModel } from "../../src/types/post-model";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import { ITestManagerCreateData } from "./types/manager.types";
import { app, RouterPaths } from "../../src";

export const postsTestManager = {
  async createPost({
    inputData,
    expectedStatusCode = HTTP_STATUSES.CREATED_201,
    authorizationCredentials = "",
  }: ITestManagerCreateData<ICreatePostModel>) {
    const response = await request(app)
      .post(RouterPaths.posts)
      .set("Authorization", authorizationCredentials)
      .send(inputData);
    expect(response.status).toBe(expectedStatusCode);

    let createdEntity;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdEntity = response.body as IPostModel;

      expect(response.body.title).toBe(inputData.title);
      expect(response.body.shortDescription).toBe(inputData.shortDescription);
      expect(response.body.content).toBe(inputData.content);
      expect(response.body.blogId).toBe(inputData.blogId);
      expect(response.body.blogName).toEqual(expect.any(String));
      expect(response.body.id).toEqual(expect.any(String));
    }

    return { response, createdEntity };
  },
};
