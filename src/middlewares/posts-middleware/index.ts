import { body } from "express-validator";
import { blogsRepository } from "../../repositories/blogs-repository";
import { NextFunction, Request, Response } from "express";
import { postsRepository } from "../../repositories/posts-repository";
import { HTTP_STATUSES } from "../../utils/httpStatuses";

export const validatePostTitleMiddleware = body("title")
  .isString()
  .trim()
  .isLength({ min: 3, max: 30 })
  .withMessage("Post title should be 3 to 30 characters");

export const validatePostShortDescriptionMiddleware = body("shortDescription")
  .isString()
  .trim()
  .isLength({ min: 3, max: 100 })
  .withMessage("Post short description should be 3 to 100 characters");

export const validatePostContentMiddleware = body("content")
  .isString()
  .trim()
  .isLength({ min: 3, max: 1000 })
  .withMessage("Post content should be 3 to 1000 characters");

export const validatePostBlogIdMiddleware = body("blogId")
  .isString()
  .trim()
  .isLength({ min: 1 })
  .withMessage("Provide blog id")
  .bail()
  .custom(async (id) => {
    const blog = await blogsRepository.getBlogById(id);
    if (!blog) {
      throw new Error("Blog doesn't exist");
    }
    return true;
  });
export const validatePostExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = await req.params.id.toString();
  const post = postsRepository.getPostById(paramId);
  if (!post) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  next();
};
