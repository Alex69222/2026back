/// <reference types="jest" />
import { app, RouterPaths } from "../../src";

import request from "supertest";
import { HTTP_STATUSES, HttpStatusType } from "../../src/utils/httpStatuses";
import { IAuthor, ICreateAuthorInputModel } from "../../src/types/author-model";

export const authorsTestManager = {
  async createAuthor(
    inputData: ICreateAuthorInputModel,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    authorizationCredintials: string = "",
  ) {
    const response = await request(app)
      .post(RouterPaths.authors)
      .set("Authorization", authorizationCredintials)
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
