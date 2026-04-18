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

blogsRouter.get("/", async (req: Request, res: Response) => {
  const blogs = await blogsRepository.getBlogs();
  res.send(blogs);
});

blogsRouter.get("/:id", async (req: Request, res: Response) => {
  const paramId = req.params.id.toString();
  const blog = await blogsRepository.getBlogById(paramId);
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

    const blog = await blogsRepository.addBlog(data);
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
  async (req: Request, res: Response) => {
    const paramId = req.params.id.toString();

    const data: ICreateBlogModel = matchedData(req);

    const updated = await blogsRepository.updateBlog(paramId, data);

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

    const deleted = await blogsRepository.deleteBlogById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
