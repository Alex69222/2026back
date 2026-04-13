import { body } from "express-validator";

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
