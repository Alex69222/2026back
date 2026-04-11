import { app, RouterPaths } from "../../src";
import {
  IAuthor,
  ICreateAuthorInputModel,
} from "../../src/features/authors/author-model";
import request from "supertest";
import { HTTP_STATUSES, HttpStatusType } from "../../src/utils/httpStatuses";

export const authorsTestManager = {
  async createAuthor(
    inputData: ICreateAuthorInputModel,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(app)
      .post(RouterPaths.authors)
      .send(inputData);
    expect(response.status).toBe(expectedStatusCode);

    let createdEntity;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdEntity = response.body as IAuthor;
      expect(response.body.name).toBe(inputData.name);
      expect(response.body.id).toEqual(expect.any(Number));
    }

    return { response, createdEntity };
  },
};
