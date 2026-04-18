/// <reference types="jest" />
import { HTTP_STATUSES } from "./../../src/utils/httpStatuses";
import request from "supertest";
import { app, RouterPaths } from "../../src/index";

import { authorsTestManager } from "../managers/authorsTestManager";
import { IAuthor, ICreateAuthorInputModel } from "../../src/types/author-model";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";

let author: IAuthor;

describe("/author-router", () => {
  beforeAll(async () => {
    await request(app).delete(RouterPaths.test_delete);
  });

  it("should return 200 and empty array", async () => {
    await request(app)
      .get(RouterPaths.authors)
      .expect(HTTP_STATUSES.OK_200, []);
  });

  it("should return 404 for not existing author", async () => {
    await request(app)
      .get(RouterPaths.authors + "/999")
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("should create author with correct input data", async () => {
    const inputData: ICreateAuthorInputModel = {
      name: "Alex",
    };

    const { createdEntity } = await authorsTestManager.createAuthor(
      inputData,
      undefined,
      validBasicAuthLoginPass,
    );

    author = createdEntity!;
  });
  it("shouldn't create author withouth basic auth", async () => {
    await authorsTestManager.createAuthor(
      { name: "" },
      HTTP_STATUSES.UNAUTHORIZED_401,
    );
  });
  it("shouldn't create author with incorrect basic auth", async () => {
    await authorsTestManager.createAuthor(
      { name: "" },
      HTTP_STATUSES.UNAUTHORIZED_401,
      "authorize me please",
    );
  });
  it("shouldn't create author with invalid data", async () => {
    const { response } = await authorsTestManager.createAuthor(
      { name: "" },
      HTTP_STATUSES.BAD_REQUEST_400,
      validBasicAuthLoginPass,
    );
    expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
  });

  it("should return author by id", async () => {
    await request(app)
      .get(`${RouterPaths.authors}/${author.id}`)
      .expect(HTTP_STATUSES.OK_200, author);
  });

  it("should update author by id", async () => {
    const updatedData: ICreateAuthorInputModel = {
      name: "Alexey",
    };

    const result = await request(app)
      .put(`${RouterPaths.authors}/${author.id}`)
      .send(updatedData);

    expect(result.status).toBe(HTTP_STATUSES.NO_CONTENT_204);

    const updatedAuthorResult = await request(app).get(
      `${RouterPaths.authors}/${author.id}`,
    );
    expect(updatedAuthorResult.body.name).toBe(updatedData.name);

    author = { ...author, ...updatedData };
  });

  it("should delete author by id", async () => {
    await request(app)
      .delete(`${RouterPaths.authors}/${author.id}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
    await request(app)
      .delete(`${RouterPaths.authors}/${author.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
    await request(app)
      .get(`${RouterPaths.authors}/${author.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
    await request(app)
      .get(RouterPaths.authors)
      .expect(HTTP_STATUSES.OK_200, []);
  });
});
