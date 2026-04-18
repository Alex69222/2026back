import { body } from "express-validator";
import { NextFunction, Request, Response } from "express";
import { blogsRepository } from "../../repositories/blogs-repository";
import { HTTP_STATUSES } from "../../utils/httpStatuses";
export const validateBlogNameMiddleware = body("name")
  .isString()
  .trim()
  .isLength({ min: 3, max: 15 })
  .withMessage("Blog name should be 3 to 15 characters");

export const validateBlogDescriptionMiddleware = body("description")
  .isString()
  .trim()
  .isLength({ min: 3, max: 500 })
  .withMessage("Blog description should be 3 to 500 characters");

export const validateBlogWebsiteUrlMiddleware = body("websiteUrl")
  .isString()
  .trim()
  .isURL()
  .isLength({ max: 100 })
  .withMessage("Blog websiteUrl should be a valid url up to 500 characters");

export const validateBlogExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = req.params.id.toString();
  const blog = await blogsRepository.getBlogById(paramId);

  if (!blog) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  next();
};
