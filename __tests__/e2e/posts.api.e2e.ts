/// <reference types="jest" />
import request from "supertest";
import { app, RouterPaths } from "../../src";
import { ICreatePostModel, IPostModel } from "../../src/types/post-model";
import { IBlogModel, ICreateBlogModel } from "../../src/types/blog-model";
import { postsTestManager } from "../managers/postsTestManager";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";
import { blogsTestManager } from "../managers/blogsTestManager";
import { MongoMemoryServer } from "mongodb-memory-server";
import { runDB, stopDB } from "../../src/repositories/db";

let blog: IBlogModel;
let post: IPostModel;
const updateBlogData: ICreateBlogModel = {
  name: "blog",
  description: "blog description",
  websiteUrl: "https://blog.com",
};
const updatePostData: ICreatePostModel = {
  blogId: "unexisting_blog_id",
  title: "post_title",
  shortDescription: "post short description",
  content: "post content",
};

describe("postsRouter", () => {
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

  it("get: should return empty array of posts and 200", async () => {
    await request(app).get(RouterPaths.posts).expect(200);
  });

  it("get/id: should return 404 for not existing post", async () => {
    await request(app)
      .get(RouterPaths.posts + "/999")
      .expect(404);
  });

  it("post: should return 401 in attempt to create post when user has no auth credentials", async () => {
    await postsTestManager.createPost({
      inputData: updatePostData,
      expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
    });
  });

  it("post: should return 401 in attempt to create post when user has wrong auth credentials", async () => {
    await postsTestManager.createPost({
      inputData: updatePostData,
      expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
      authorizationCredentials: "Basic wrong_user:wrong_pass",
    });
  });

  it("post: should return 400 in attempt to create post with unexisting blog id", async () => {
    await postsTestManager.createPost({
      inputData: updatePostData,
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
  });

  it("post: 400 attempt to create post with invalid data", async () => {
    const { createdEntity } = await blogsTestManager.createBlog({
      inputData: updateBlogData,
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    blog = createdEntity!;

    await postsTestManager.createPost({
      inputData: { ...updatePostData, blogId: blog.id, title: "a".repeat(31) },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    await postsTestManager.createPost({
      inputData: {
        ...updatePostData,
        blogId: blog.id,
        shortDescription: "a".repeat(101),
      },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    await postsTestManager.createPost({
      inputData: {
        ...updatePostData,
        blogId: blog.id,
        content: "a".repeat(1001),
      },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
  });

  it("post: should create post with valid data", async () => {
    const { createdEntity } = await postsTestManager.createPost({
      inputData: { ...updatePostData, blogId: blog.id },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    post = createdEntity!;

    const result = await request(app).get(RouterPaths.posts).expect(200);
    expect(result.body.items[0]).toEqual(post);
  });

  it("put: shouldn't update post with invalid data or without anuthorization", async () => {
    await request(app)
      .put(RouterPaths.posts + `/${post.id}`)
      .send(post)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    await request(app)
      .put(RouterPaths.posts + `/unexisting_post_id`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...post,
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app)
      .put(RouterPaths.posts + `/${post.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...post,
        blogId: "unexisting_blog_id",
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.posts + `/${post.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...post,
        title: "a".repeat(31),
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.posts + `/${post.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...post,
        shortDescription: "a".repeat(101),
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.posts + `/${post.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...post,
        content: "a".repeat(1001),
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });

  it("should update post", async () => {
    await request(app)
      .put(RouterPaths.posts + `/${post.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...post,
        title: "another title",
        shortDescription: "another shortDescription",
        content: "another content",
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it("should update post's blog", async () => {
    const updatedPost = await request(app)
      .get(RouterPaths.posts + `/${post.id}`)
      .expect(HTTP_STATUSES.OK_200);
    const { createdEntity: anotherBlog } = await blogsTestManager.createBlog({
      inputData: {
        ...updateBlogData,
        name: "next blog name",
      },
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    await request(app)
      .put(RouterPaths.posts + `/${updatedPost.body.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({
        ...updatedPost.body,
        blogId: anotherBlog!.id,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);
    const anotherUpdatedPost = await request(app)
      .get(RouterPaths.posts + `/${post.id}`)
      .expect(HTTP_STATUSES.OK_200);
    expect(updatedPost.body.id).toBe(anotherUpdatedPost.body.id);
    expect(updatedPost.body.blogName).toBe(blog.name);
    expect(anotherUpdatedPost.body.blogName).toBe(anotherBlog!.name);
  });

  it("should not delete post if unauthorized or unexisted", async () => {
    await request(app)
      .delete(RouterPaths.posts + `/${post.id}`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    await request(app)
      .delete(RouterPaths.posts + `/unexisted_post_id`)
      .set("Authorization", validBasicAuthLoginPass)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("should delete post", async () => {
    await request(app)
      .delete(RouterPaths.posts + `/${post.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get(RouterPaths.posts + `/${post.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    const result = await request(app)
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(result.body.items).toEqual([]);
  });
});
