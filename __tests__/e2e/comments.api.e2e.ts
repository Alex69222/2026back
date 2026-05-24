import { HTTP_STATUSES } from "./../../src/utils/httpStatuses";
/// <reference types="jest" />
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { runDB, stopDB } from "../../src/repositories/db";
import app, { RouterPaths } from "../../src";
import { postsTestManager } from "../managers/postsTestManager";
import { ICreateUserModel } from "../../src/types/users-model";
import { usersTestManager } from "../managers/usersTestmanager";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";
import { blogsTestManager } from "../managers/blogsTestManager";
let accessToken: string;
let accessToken2: string;
let blogId: string;
let postId: string;
let commmentId: string;
const userData: ICreateUserModel = {
  login: "user",
  password: "user_password",
  email: "user@mail.com",
};
const userData2: ICreateUserModel = {
  login: "user2",
  password: "user2_password",
  email: "user2@mail.com",
};
describe("test comments", () => {
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

  it("should forbid to create comment when user is not authorised", async () => {
    await postsTestManager.createComment("222", {
      inputData: { content: "new comment" },
      expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
    });
  });

  it("should create and log in user", async () => {
    await usersTestManager.createUser({
      inputData: userData,
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    const authData = await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: userData.email,
        password: userData.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(authData.body.accessToken).toEqual(expect.any(String));
    accessToken = authData.body.accessToken;
  });

  it("should return 404 when try to comment unexisting post", async () => {
    await postsTestManager.createComment("222", {
      inputData: { content: "new comment" },
      expectedStatusCode: HTTP_STATUSES.NOT_FOUND_404,
      authorizationCredentials: accessToken,
    });
  });

  it("should create blog, it's post and comment to the post", async () => {
    const blog = await blogsTestManager.createBlog({
      inputData: {
        name: "travel blog",
        description: "blog about traveling",
        websiteUrl: "https://travel-blog.com",
      },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    blogId = blog.createdEntity!.id;

    const post = await postsTestManager.createPost({
      inputData: {
        blogId,
        content: "Post for travel blog",
        shortDescription: "short desc for travel blog post",
        title: "Best holiday places",
      },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    postId = post.createdEntity!.id;

    await postsTestManager.createComment(postId, {
      inputData: {
        content: "Very nice post! I liked it so much!",
      },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: accessToken,
    });
  });

  it("should return 404  when user attempts to get post comments for unexisting post", async () => {
    const result = await request(app).get(
      RouterPaths.posts + "/" + "222" + "/comments",
    );

    expect(result.status).toBe(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("should return pagination with one post", async () => {
    const result = await request(app).get(
      RouterPaths.posts + "/" + postId + "/comments",
    );
    expect(result.body.totalCount).toBe(1);
    expect(result.body.items.length).toBe(1);
  });

  it("should add more comments for post and return it by post id", async () => {
    await postsTestManager.createComment(postId, {
      inputData: {
        content: "BEST post EVER! I liked it so much! YEAH",
      },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: accessToken,
    });

    await postsTestManager.createComment(postId, {
      inputData: {
        content: "ENJOYED the post ! I LOVE it so much! THANK you",
      },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: accessToken,
    });

    const result = await request(app).get(
      RouterPaths.posts + "/" + postId + "/comments",
    );

    expect(result.body.totalCount).toBe(3);
    expect(result.body.items.length).toBe(3);
    commmentId = result.body.items[0].id;
  });

  it("should return 404 when try to get unexisting comment", async () => {
    await request(app)
      .get(RouterPaths.comments + "/" + "no_comment_id")
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("should return comment by id", async () => {
    await request(app)
      .get(RouterPaths.comments + "/" + commmentId)
      .expect(HTTP_STATUSES.OK_200);
  });

  it("should forbid to update comment for unauthorized user", async () => {
    await request(app)
      .put(RouterPaths.comments + "/" + "no_comment_id")
      .send({
        content: "no",
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it("should return 404 in attempt to update non-existing comment", async () => {
    await request(app)
      .put(RouterPaths.comments + "/" + "no_comment_id")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "no",
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("should forbid (403) to update comment by the user, who didn't create it", async () => {
    await usersTestManager.createUser({
      inputData: userData2,
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    const authData = await request(app)
      .post(RouterPaths.auth + "/login")
      .send({
        loginOrEmail: userData2.email,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(authData.body.accessToken).toEqual(expect.any(String));
    accessToken2 = authData.body.accessToken;

    await request(app)
      .put(RouterPaths.comments + "/" + commmentId)
      .set("Authorization", `Bearer ${accessToken2}`)
      .send({
        content: "no",
      })
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it("should return 400 when trying to update comment with invalid data", async () => {
    await request(app)
      .put(RouterPaths.comments + "/" + commmentId)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "no",
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });

  it("update comment with nvalid data (204)", async () => {
    const content = "WOW! THE BEST COMMENT EVER! LIKED IT SO MUCH!";
    await request(app)
      .put(RouterPaths.comments + "/" + commmentId)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it("forbid to delete comment for unauthorized user", async () => {
    await request(app)
      .delete(RouterPaths.comments + "/" + commmentId)

      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it("return 404 in attempt to delete non-existing comment", async () => {
    await request(app)
      .delete(RouterPaths.comments + "/" + "non_existing_comment_id")
      .set("Authorization", `Bearer ${accessToken}`)

      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("forbid to delete comment that doesn't belong to the user(403)", async () => {
    await request(app)
      .delete(RouterPaths.comments + "/" + commmentId)
      .set("Authorization", `Bearer ${accessToken2}`)

      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it("delete comment by id", async () => {
    await request(app)
      .delete(RouterPaths.comments + "/" + commmentId)
      .set("Authorization", `Bearer ${accessToken}`)

      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get(RouterPaths.comments + "/" + commmentId)
      .set("Authorization", `Bearer ${accessToken}`)

      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});
