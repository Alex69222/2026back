import "dotenv/config";
import express, { Request, Response } from "express";
import { productsRouter } from "./routes/products-router";
import { videosRouter } from "./routes/videos-router";

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
