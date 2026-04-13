import request from "supertest";
import { app, RouterPaths } from "../../src";
import { IBlogModel, ICreateBlogModel } from "../../src/types/blog-model";
import { blogsTestManager } from "../managers/blogsTestManager";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";

let blog: IBlogModel;
const updatedData: ICreateBlogModel = {
  name: "Best blog ever!",
  description: "Best blog in the world description",
  websiteUrl: "https://best-blog-in-the-world.com",
};
describe("/blogsRouter", () => {
  beforeAll(async () => {
    await request(app).delete(RouterPaths.test_delete);
  });

  it("get: should return empty array of blogs and 200", async () => {
    await request(app).get(RouterPaths.blogs).expect(200, []);
  });

  it("get/id: should return 404 for not existing blog", async () => {
    await request(app)
      .get(RouterPaths.blogs + "/999")
      .expect(404);
  });

  it("post: should return 401 in attempt to create blog when user has no auth credentials", async () => {
    const correctInputData: ICreateBlogModel = {
      name: "Best Blog",
      description: "Best blog description",
      websiteUrl: "https://best-blog.com",
    };
    blogsTestManager.createBlog({
      inputData: correctInputData,
      expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
    });
  });

  it("post: should return 401 in attempt to create blog when user has wrong auth credentials", async () => {
    const correctInputData: ICreateBlogModel = {
      name: "Best Blog",
      description: "Best blog description",
      websiteUrl: "https://best-blog.com",
    };
    blogsTestManager.createBlog({
      inputData: correctInputData,
      expectedStatusCode: HTTP_STATUSES.UNAUTHORIZED_401,
      authorizationCredentials: "Basic wrong_user:wrong_pass",
    });
  });
  it("post: shouldn't  create blog when user has invalid data", async () => {
    const incorrectInputData: ICreateBlogModel = {
      name: "Best Blog",
      description: "Best blog description",
      websiteUrl: "https://best-blog.com",
    };

    blogsTestManager.createBlog({
      inputData: { ...incorrectInputData, name: "a".repeat(16) },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
    blogsTestManager.createBlog({
      inputData: { ...incorrectInputData, name: "a".repeat(2) },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
    blogsTestManager.createBlog({
      inputData: { ...incorrectInputData, description: "a".repeat(501) },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
    blogsTestManager.createBlog({
      inputData: { ...incorrectInputData, description: "a".repeat(2) },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
    blogsTestManager.createBlog({
      inputData: { ...incorrectInputData, websiteUrl: "a".repeat(101) },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
    blogsTestManager.createBlog({
      inputData: { ...incorrectInputData, websiteUrl: "incorrect_url" },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
      authorizationCredentials: validBasicAuthLoginPass,
    });
  });

  it("post: should  create blog when user has valid auth credentials", async () => {
    const correctInputData: ICreateBlogModel = {
      name: "Best Blog",
      description: "Best blog description",
      websiteUrl: "https://best-blog.com",
    };
    const { createdEntity } = await blogsTestManager.createBlog({
      inputData: correctInputData,
      expectedStatusCode: HTTP_STATUSES.CREATED_201,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    blog = createdEntity!;

    await request(app).get(RouterPaths.blogs).expect(200, [blog]);
  });

  it("get/id: should get blog by id", async () => {
    await request(app)
      .get(RouterPaths.blogs + `/${blog.id}`)
      .expect(HTTP_STATUSES.OK_200, blog);
  });

  it("put/id: should return 401 if user tries to update blog without auth credentials", async () => {
    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .send(updatedData)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it("put/id: should return 401 if user tries to update blog with invalid auth credentials", async () => {
    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", "Basic wrongUser:wrongPass")
      .send(updatedData)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it("put/id: should return 400 if user tries to update blog with invalid data", async () => {
    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({ ...updatedData, name: "n".repeat(2) })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({ ...updatedData, name: "n".repeat(16) })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({ ...updatedData, description: "d".repeat(2) })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({ ...updatedData, description: "d".repeat(501) })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({ ...updatedData, websiteUrl: "w".repeat(101) })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send({ ...updatedData, websiteUrl: "incorrect_url" })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });

  it("put/id: should update blog", async () => {
    await request(app)
      .put(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .send(updatedData)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    blog = { ...blog, ...updatedData };

    await request(app)
      .get(RouterPaths.blogs + `/${blog.id}`)
      .expect(HTTP_STATUSES.OK_200, blog);
  });

  it("delete/id: should not allow to delete blog without auth credentials", async () => {
    await request(app)
      .delete(RouterPaths.blogs + `/${blog.id}`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });
  it("delete/id: should not allow to delete blog with invalid auth credentials", async () => {
    await request(app)
      .delete(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", "Basic user:passsword")
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });
  it("delete/id: should return 404 in attempt to delete not exiting blog", async () => {
    await request(app)
      .delete(RouterPaths.blogs + `/not-existing-id`)
      .set("Authorization", validBasicAuthLoginPass)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("delete/id: should delete blog", async () => {
    await request(app)
      .delete(RouterPaths.blogs + `/${blog.id}`)
      .set("Authorization", validBasicAuthLoginPass)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get(RouterPaths.blogs + `/${blog.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app).get(RouterPaths.blogs).expect(HTTP_STATUSES.OK_200, []);
  });
});
