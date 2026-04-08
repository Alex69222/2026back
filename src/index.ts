import "dotenv/config";
import express, { Request, Response } from "express";
import { productsRouter } from "./routes/products-router";
import { videosRouter } from "./routes/videos-router";
import { dataBase } from "./repository/memoryDB";

const port = process.env.PORT || 3000;
const baseUrl = "/api";
const app = express();
app.use(express.json());

app.use(baseUrl + "/products", productsRouter);
app.use(baseUrl + "/videos", videosRouter);

app.get("/", (req: Request, res: Response) => {
  const message = "Hello World!!!";
  res.send(message);
});

app.delete(baseUrl + "/testing/all-data", (req: Request, res: Response) => {
  dataBase.videos = [];
  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
