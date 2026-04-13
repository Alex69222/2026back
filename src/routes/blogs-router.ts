import { Request, Response, Router } from "express";
import { blogsRepository } from "../repositories/blogs-repository";
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

export const blogsRouter = Router();

blogsRouter.get("/", (req: Request, res: Response) => {
  res.send(blogsRepository.getBlogs());
});

blogsRouter.get("/:id", (req: Request, res: Response) => {
  const paramId = req.params.id.toString();
  const blog = blogsRepository.getBlogById(paramId);
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
  (req: Request, res: Response) => {
    const data: ICreateBlogModel = matchedData(req);

    const blog = blogsRepository.addBlog(data);
    res.status(HTTP_STATUSES.CREATED_201).send(blog);
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
  (req: Request, res: Response) => {
    const paramId = req.params.id.toString();

    const data: ICreateBlogModel = matchedData(req);

    const updated = blogsRepository.updateBlog(paramId, data);

    updated
      ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.status(HTTP_STATUSES.BAD_REQUEST_400).json(unexpectedErrorMsgJson);
  },
);

blogsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  validateBlogExistsMiddleware,
  (req: Request, res: Response) => {
    const paramId = req.params.id.toString();

    const deleted = blogsRepository.deleteBlogById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
