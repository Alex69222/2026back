import { Request, Response, Router } from "express";

import { HTTP_STATUSES } from "../utils/httpStatuses";
import { basicAuthMiddleware } from "../middlewares/auth-middlewares/basic-auth-middleware";
import {
  validateBlogDescriptionMiddleware,
  validateBlogExistsMiddleware,
  validateBlogNameMiddleware,
  validateBlogWebsiteUrlMiddleware,
} from "../middlewares/blogs-middlewares";
import { ICreateBlogModel } from "../types/blog-model";
import { matchedData } from "express-validator";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { unexpectedErrorMsgJson } from "../utils/errors";
import { blogsService } from "../domain/blogs-service";
import { qpNormalizer } from "../utils/qpNormalizer";
import {
  validatePostContentMiddleware,
  validatePostShortDescriptionMiddleware,
  validatePostTitleMiddleware,
} from "../middlewares/posts-middleware";
import { ICreatePostModel } from "../types/post-model";
import { postsService } from "../domain/posts-service";

export const blogsRouter = Router();

blogsRouter.get("/", async (req: Request, res: Response) => {
  const normalizedQp = qpNormalizer(req.query);
  const blogs = await blogsService.getBlogs(normalizedQp);
  res.send(blogs);
});

blogsRouter.get("/:id", async (req: Request, res: Response) => {
  const paramId = req.params.id.toString();
  const blog = await blogsService.getBlogById(paramId);
  if (!blog) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  res.send(blog);
});

blogsRouter.post(
  "/",
  basicAuthMiddleware,
  validateBlogNameMiddleware,
  validateBlogDescriptionMiddleware,
  validateBlogWebsiteUrlMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const data: ICreateBlogModel = matchedData(req);

    const blog = await blogsService.addBlog(data);
    res.status(HTTP_STATUSES.CREATED_201).send(blog);
  },
);

blogsRouter.get(
  "/:id/posts",
  validateBlogExistsMiddleware,
  async (req: Request, res: Response) => {
    const normalizedQp = qpNormalizer(req.query);
    const posts = await postsService.getPosts(normalizedQp, {
      blogId: req.params.id.toString(),
    });
    res.send(posts);
  },
);

blogsRouter.post(
  "/:id/posts",
  basicAuthMiddleware,
  validatePostTitleMiddleware,
  validatePostShortDescriptionMiddleware,
  validatePostContentMiddleware,
  validateBlogExistsMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const data: ICreatePostModel = matchedData(req);
    const post = await postsService.addPost({
      ...data,
      blogId: req.params.id.toString(),
    });

    if (!post)
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json(unexpectedErrorMsgJson);

    res.status(HTTP_STATUSES.CREATED_201).send(post);
  },
);

blogsRouter.put(
  "/:id",
  basicAuthMiddleware,
  validateBlogExistsMiddleware,
  validateBlogNameMiddleware,
  validateBlogDescriptionMiddleware,
  validateBlogWebsiteUrlMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const paramId = req.params.id.toString();

    const data: ICreateBlogModel = matchedData(req);

    const updated = await blogsService.updateBlog(paramId, data);

    updated
      ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.status(HTTP_STATUSES.BAD_REQUEST_400).json(unexpectedErrorMsgJson);
  },
);

blogsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  validateBlogExistsMiddleware,
  async (req: Request, res: Response) => {
    const paramId = req.params.id.toString();

    const deleted = await blogsService.deleteBlogById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
