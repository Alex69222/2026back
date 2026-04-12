import { Router, Request, Response } from "express";
import { dataBase } from "../repositories/memoryDB";
import { IAPIErrorResult } from "../types/error/api-error";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { IAuthor } from "../types/author-model";

export const authorsRouter = Router();

authorsRouter.get("/", (req: Request, res: Response) => {
  res.send(dataBase.authors);
});

authorsRouter.get("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const author = dataBase.authors.find((v) => v.id === paramId);
  if (!author) return res.sendStatus(404);
  res.send(author);
});

authorsRouter.post("/", (req: Request, res: Response) => {
  const responseError: IAPIErrorResult = {
    errorsMessages: [],
  };

  const name: string = req.body.name;
  if (!name || typeof name !== "string") {
    responseError.errorsMessages!.push({
      field: "name",
      message: "Name was not provided",
    });
  }
  if (name && name.length > 20) {
    responseError.errorsMessages!.push({
      field: "name",
      message: "Max length 20",
    });
  }

  if (responseError.errorsMessages!.length) {
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
  }
  const date = new Date();
  const author: IAuthor = {
    id: +date,
    name,
  };
  dataBase.authors.push(author);
  res.status(HTTP_STATUSES.CREATED_201).send(author);
});

authorsRouter.put("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const author = dataBase.authors.find((v) => v.id === paramId);
  if (!author) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  const responseError: IAPIErrorResult = {
    errorsMessages: [],
  };

  const name: string = req.body.name;

  if (!name || typeof name !== "string") {
    responseError.errorsMessages!.push({
      field: "title",
      message: "Title was not provided",
    });
  }
  if (name && name.length > 20) {
    responseError.errorsMessages!.push({
      field: "title",
      message: "Max length 20",
    });
  }

  if (responseError.errorsMessages!.length) {
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
  }

  author.name = name;

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

authorsRouter.delete("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const authorIndex = dataBase.authors.findIndex((v) => v.id === paramId);
  if (authorIndex === -1) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  dataBase.authors.splice(authorIndex, 1);
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
