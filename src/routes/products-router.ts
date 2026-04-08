import { Router, Request, Response } from "express";

let products: Array<{
  id: number;
  title: string;
}> = [
  { id: 1, title: "iPhone 15" },
  { id: 2, title: "Samsung Galaxy S24" },
  { id: 3, title: "MacBook Air M3" },
  { id: 4, title: "Dell XPS 13" },
  { id: 5, title: "iPad Air" },
  { id: 6, title: "AirPods Pro" },
  { id: 7, title: "Sony WH-1000XM5" },
  { id: 8, title: "Apple Watch Series 9" },
  { id: 9, title: "Logitech MX Master 3S" },
  { id: 10, title: "Keychron K8" },
  { id: 11, title: "PlayStation 5" },
  { id: 12, title: "Xbox Series X" },
  { id: 13, title: "Nintendo Switch OLED" },
  { id: 14, title: "GoPro HERO 12" },
  { id: 15, title: "Kindle Paperwhite" },
];

export const productsRouter = Router();

productsRouter.get("/", (req: Request, res: Response) => {
  const searchString = req.query.title?.toString();
  if (!searchString) return res.send(products);

  res.send(
    products.filter((p) =>
      p.title.toLowerCase().includes(searchString.toLowerCase()),
    ),
  );
});

productsRouter.get("/:id", (req: Request, res: Response) => {
  const paramId = req.params.id;
  const product = products.find((p) => p.id === +paramId);
  if (!product) return res.sendStatus(404);
  res.send(product);
});

productsRouter.delete("/:id", (req: Request, res: Response) => {
  const productId = +req.params.id;
  const product = products.find((p) => p.id === productId);
  if (!product) return res.sendStatus(404);
  products = products.filter((p) => p.id !== productId);
  res.sendStatus(204);
});

productsRouter.post("/", (req: Request, res: Response) => {
  const title = req.body?.title.trim();
  if (!title) return res.status(400).send("Product title was not provided");

  const product = {
    id: +new Date(),
    title,
  };
  products.push(product);

  res.status(201).send(product);
});

productsRouter.put("/:id", (req: Request, res: Response) => {
  const productId = +req.params.id;
  const product = products.find((p) => p.id === productId);
  if (!product) return res.sendStatus(404);

  const title = req.body?.title.trim();
  if (!title) return res.status(400).send("Product title was not provided");

  product.title = title;

  res.sendStatus(200);
});
