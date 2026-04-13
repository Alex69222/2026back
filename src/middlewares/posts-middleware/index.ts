import { body } from "express-validator";

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
  .withMessage("Provide blog id");
