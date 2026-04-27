import "dotenv/config";
import express, { Request, Response } from "express";
import { productsRouter } from "./routes/products-router";
import { videosRouter } from "./routes/videos-router";
import { dataBase } from "./repositories/memoryDB";
import { authorsRouter } from "./routes/authors-router";
import { authorsVideosBindingsRouter } from "./routes/authors-videos-bindings-router";
import { videosRepository } from "./repositories/videos-repository";
import { blogsRepository } from "./repositories/blogs-repository";
import { postsRepository } from "./repositories/posts-repository";
import { blogsRouter } from "./routes/blogs-router";
import { postsRouter } from "./routes/posts-router";
import { runDB } from "./repositories/db";
import { usersRouter } from "./routes/users.router";
import { usersRepository } from "./repositories/users-repository";
import { authRouter } from "./routes/auth-router";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const baseUrl = "/api";

export const RouterPaths = {
  blogs: baseUrl + "/blogs",
  posts: baseUrl + "/posts",
  products: baseUrl + "/products",
  videos: baseUrl + "/videos",
  authors: baseUrl + "/authors",
  authorsVideosBingings: "/authors-videos-bindings",
  users: "/users",
  auth: "/auth",
  test_delete: baseUrl + "/testing/all-data",
};

const port = process.env.PORT || 3000;
export const app = express();
app.use(express.json());

app.use(RouterPaths.blogs, blogsRouter);
app.use(RouterPaths.posts, postsRouter);
app.use(RouterPaths.users, usersRouter);
app.use(RouterPaths.auth, authRouter);

app.use(RouterPaths.products, productsRouter);
app.use(RouterPaths.videos, videosRouter);
app.use(RouterPaths.authors, authorsRouter);

app.use(RouterPaths.authorsVideosBingings, authorsVideosBindingsRouter);

app.get("/", (req: Request, res: Response) => {
  const message = "Hello World!!!";
  res.send(message);
});

app.delete(RouterPaths.test_delete, async (req: Request, res: Response) => {
  videosRepository.clearVideos();
  await blogsRepository.deleteBlogs();
  await postsRepository.deletePosts();
  await usersRepository.deleteUsers();
  dataBase.authors = [];
  dataBase.authorVideoBindings = [];
  res.sendStatus(204);
});

export const startApp = async () => {
  await runDB(MONGO_URI);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
if (process.env.NODE_ENV !== "test") {
  startApp();
}

export default app;
