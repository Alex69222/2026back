import { Request, Response, Router } from "express";
import { postsRepository } from "../repositories/posts-repository";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { basicAuthMiddleware } from "../middlewares/auth-middlewares/basic-auth-middleware";
import {
  validatePostBlogIdMiddleware,
  validatePostContentMiddleware,
  validatePostExistsMiddleware,
  validatePostShortDescriptionMiddleware,
  validatePostTitleMiddleware,
} from "../middlewares/posts-middleware";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { matchedData } from "express-validator";
import { ICreatePostModel } from "../types/post-model";
import { unexpectedErrorMsgJson } from "../utils/errors";
export const postsRouter = Router();

postsRouter.get("/", (req: Request, res: Response) => {
  res.send(postsRepository.getPosts());
});

postsRouter.get("/:id", (req: Request, res: Response) => {
  const paramId = req.params.id.toString();
  const post = postsRepository.getPostById(paramId);
  if (!post) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  res.send(post);
});

postsRouter.post(
  "/",
  basicAuthMiddleware,
  validatePostTitleMiddleware,
  validatePostShortDescriptionMiddleware,
  validatePostContentMiddleware,
  validatePostBlogIdMiddleware,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const data: ICreatePostModel = matchedData(req);
    const post = postsRepository.addPost(data);

    if (!post)
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json(unexpectedErrorMsgJson);

    res.status(HTTP_STATUSES.CREATED_201).send(post);
  },
);

postsRouter.put(
  "/:id",
  basicAuthMiddleware,
  validatePostExistsMiddleware,
  validatePostTitleMiddleware,
  validatePostShortDescriptionMiddleware,
  validatePostContentMiddleware,
  validatePostBlogIdMiddleware,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const paramId = req.params.id.toString();
    const data: ICreatePostModel = matchedData(req);

    const updated = postsRepository.updatePost(paramId, data);

    updated
      ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.status(HTTP_STATUSES.BAD_REQUEST_400).json(unexpectedErrorMsgJson);
  },
);

postsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  validatePostExistsMiddleware,
  (req: Request, res: Response) => {
    const paramId = req.params.id.toString();
    const deleted = postsRepository.deletePostById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
