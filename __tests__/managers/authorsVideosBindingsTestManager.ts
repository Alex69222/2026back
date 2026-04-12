import { app, RouterPaths } from "../../src";
import request from "supertest";
import { HTTP_STATUSES, HttpStatusType } from "../../src/utils/httpStatuses";
import {
  IAuthorVideoBinging,
  ICreateAuthorVideoBindingModel,
} from "../../src/types/authors-videos-bindings-model";

export const authorsVideosBindingTestManager = {
  async createBinding(
    inputData: ICreateAuthorVideoBindingModel,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(app)
      .post(RouterPaths.authorsVideosBingings)
      .send(inputData);
    expect(response.status).toBe(expectedStatusCode);

    let createdEntity;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdEntity = response.body as IAuthorVideoBinging;
      expect(createdEntity.authorId).toBe(inputData.authorId);
      expect(createdEntity.videoId).toEqual(expect.any(Number));
    }

    return { response, createdEntity };
  },
};
