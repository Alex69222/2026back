import { Request, Response, Router } from "express";
import { blogsRepository } from "../repositories/blogs-repository";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { basicAuthMiddleware } from "../middlewares/auth-middlewares/basic-auth-middleware";
import {
  validateBlogDescriptionMiddleware,
  validateBlogNameMiddleware,
  validateBlogWebsiteUrlMiddleware,
} from "../middlewares/blogs-middlewares";
import { ICreateBlogModel } from "../types/blog-model";
import { matchedData } from "express-validator";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";

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
  validateBlogNameMiddleware,
  validateBlogDescriptionMiddleware,
  validateBlogWebsiteUrlMiddleware,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const paramId = req.params.id.toString();
    const blogForUpdate = blogsRepository.getBlogById(paramId);

    if (!blogForUpdate) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    const data: ICreateBlogModel = matchedData(req);

    const updated = blogsRepository.updateBlog(paramId, data);

    res.sendStatus(
      updated ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);

blogsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  (req: Request, res: Response) => {
    const paramId = req.params.id.toString();
    const blogForDeletion = blogsRepository.getBlogById(paramId);

    if (!blogForDeletion) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);

    const deleted = blogsRepository.deleteBlogById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
