import "dotenv/config";
import express, { Request, Response } from "express";
import { productsRouter } from "./routes/products-router";
import { videosRouter } from "./routes/videos-router";
import { dataBase } from "./repositories/memoryDB";
import { authorsRouter } from "./routes/authors-router";
import { authorsVideosBindingsRouter } from "./routes/authors-videos-bindings-router";
import { videosRepository } from "./repositories/videos-repository";

const baseUrl = "/api";

export const RouterPaths = {
  products: baseUrl + "/products",
  videos: baseUrl + "/videos",
  authors: baseUrl + "/authors",
  authorsVideosBingings: "/authors-videos-bindings",
  test_delete: baseUrl + "/testing/all-data",
};

const port = process.env.PORT || 3000;
export const app = express();
app.use(express.json());

app.use(RouterPaths.products, productsRouter);
app.use(RouterPaths.videos, videosRouter);
app.use(RouterPaths.authors, authorsRouter);
app.use(RouterPaths.authorsVideosBingings, authorsVideosBindingsRouter);

app.get("/", (req: Request, res: Response) => {
  const message = "Hello World!!!";
  res.send(message);
});

app.delete(RouterPaths.test_delete, (req: Request, res: Response) => {
  videosRepository.clearVideos();
  dataBase.authors = [];
  dataBase.authorVideoBindings = [];
  res.sendStatus(204);
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
export default app;
