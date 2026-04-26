import { Request, Response, Router } from "express";

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
import { ICreatePostModel, IPostModel } from "../types/post-model";
import { IErrorMessage, unexpectedErrorMsgJson } from "../utils/errors";
import { postsService } from "../domain/posts-service";
import { qpNormalizer } from "../utils/qpNormalizer";
import { postsQueryRepository } from "../repositories/posts-query-repository";
export const postsRouter = Router();

postsRouter.get("/", async (req: Request, res: Response) => {
  const normalizedQp = qpNormalizer(req.query);
  const posts = await postsQueryRepository.getPosts(normalizedQp);
  res.send(posts);
});

postsRouter.get("/:id", async (req: Request, res: Response) => {
  const paramId = req.params.id.toString();
  const post = await postsQueryRepository.getPostById(paramId);
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
  async (req: Request, res: Response<IPostModel | IErrorMessage>) => {
    const data: ICreatePostModel = matchedData(req);
    const createdPostId = await postsService.addPost(data);

    if (!createdPostId)
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json(unexpectedErrorMsgJson);
    const post = await postsQueryRepository.getPostById(createdPostId);
    res.status(HTTP_STATUSES.CREATED_201).send(post!);
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
  async (req: Request, res: Response) => {
    const paramId = req.params.id.toString();
    const data: ICreatePostModel = matchedData(req);

    const updated = await postsService.updatePost(paramId, data);

    updated
      ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.status(HTTP_STATUSES.BAD_REQUEST_400).json(unexpectedErrorMsgJson);
  },
);

postsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  validatePostExistsMiddleware,
  async (req: Request, res: Response) => {
    const paramId = req.params.id.toString();
    const deleted = await postsService.deletePostById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
