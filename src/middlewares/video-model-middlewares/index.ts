import { body } from "express-validator";
import { VideoResulutionsEnum } from "../../types/video-model";

export const validateVideoTitleMiddleware = body("title")
  .trim()
  .isLength({ min: 3, max: 40 })
  .withMessage("Title should be 3 to 40 characters");

export const validateVideoAuthorMiddleware = body("author")
  .trim()
  .isLength({ min: 3, max: 20 })
  .withMessage("Author should be 3 to 20 characters");

export const validateVideoResolutionsMiddleware = body("availableResolutions")
  .isArray({ min: 1 })
  .bail()
  .withMessage("availableResolutions must be a non-empty array")
  .custom((resolutions) => {
    const validValues = Object.values(VideoResulutionsEnum);
    const isValid = resolutions.every((v: VideoResulutionsEnum) =>
      validValues.includes(v),
    );
    if (!isValid) {
      throw new Error(
        "All items in availableResolutions must be valid resolution values",
      );
    }
    return true;
  });

export const validateVideoCanBeDownloadedMiddleware = body("canBeDownloaded")
  .isBoolean()
  .withMessage("canBeDownloaded must be a boolean");

export const validateVideoMinAgeRestrictionMiddleware = body(
  "minAgeRestriction",
)
  .exists()
  .optional({ nullable: true })
  .isInt({ min: 1, max: 18 })
  .withMessage("minAgeRestriction must be null or an integer between 1 and 18");

export const validateVideoPublicationDateMiddleware = body("publicationDate")
  .isString()
  .isISO8601({ strict: true, strictSeparator: true })
  .withMessage("publicationDate must be a valid ISO 8601 date-time string");
