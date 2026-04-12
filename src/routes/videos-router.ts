import { Router, Request, Response, NextFunction } from "express";
import { VideoResulutionsEnum } from "../types/video-model";
import { IAPIErrorResult } from "../types/error/api-error";
import { isValidDateTimeString } from "../utils/isValidDateTimeString";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { videosRepository } from "../repositories/videos-repository";
import { body, matchedData, validationResult } from "express-validator";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";

const validateTitleMiddleware = body("title")
  .trim()
  .isLength({ min: 3, max: 40 })
  .withMessage("Title should be 3 to 40 characters");
const validateAuthorMiddleware = body("author")
  .trim()
  .isLength({ min: 3, max: 20 })
  .withMessage("Author should be 3 to 20 characters");

export const videosRouter = Router();

videosRouter.get("/", (req: Request, res: Response) => {
  res.send(videosRepository.getVideos());
});

videosRouter.get("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const video = videosRepository.getVideoById(paramId);
  if (!video) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  res.send(video);
});

videosRouter.post(
  "/",
  // (req: Request, res: Response, next: NextFunction) => {
  //   next();
  // },
  validateTitleMiddleware,
  validateAuthorMiddleware,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const result = validationResult(req);

    const responseError: IAPIErrorResult = {
      errorsMessages: result
        .array()
        //@ts-ignore
        .map((er) => ({ field: er.path, message: er.msg })),
    };
    const data = matchedData(req);
    const availableResolutions = req.body.availableResolutions;

    if (
      !Array.isArray(availableResolutions) ||
      availableResolutions.length === 0
    ) {
      responseError.errorsMessages!.push({
        field: "availableResolutions",
        message: "availableResolutions must be a non-empty array",
      });
    } else {
      const validValues = Object.values(VideoResulutionsEnum);
      const isValid = availableResolutions.every((v) =>
        validValues.includes(v),
      );

      if (!isValid) {
        responseError.errorsMessages!.push({
          field: "availableResolutions",
          message:
            "All items in availableResolutions must be valid resolution values",
        });
      }
    }

    if (responseError.errorsMessages!.length) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
    }

    const video = videosRepository.addVideo({
      title: data.title,
      author: data.author,
      availableResolutions,
    });
    res.status(HTTP_STATUSES.CREATED_201).send(video);
  },
);

videosRouter.put("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const video = videosRepository.getVideoById(paramId);
  if (!video) return res.sendStatus(404);
  const responseError: IAPIErrorResult = {
    errorsMessages: [],
  };

  const title: string = req.body.title;
  const author: string = req.body.author;
  const availableResolutions = req.body.availableResolutions;
  const canBeDownloaded = req.body.canBeDownloaded;
  const minAgeRestriction = req.body.minAgeRestriction;
  const publicationDate: string = req.body.publicationDate;

  if (!title || typeof title !== "string") {
    responseError.errorsMessages!.push({
      field: "title",
      message: "Title was not provided",
    });
  }
  if (title && title.length > 40) {
    responseError.errorsMessages!.push({
      field: "title",
      message: "Max length 40",
    });
  }
  if (!author || typeof author !== "string") {
    responseError.errorsMessages!.push({
      field: "author",
      message: "Author was not provided",
    });
  }
  if (author && author.length > 20) {
    responseError.errorsMessages!.push({
      field: "author",
      message: "Max length 40",
    });
  }
  if (
    !Array.isArray(availableResolutions) ||
    availableResolutions.length === 0
  ) {
    responseError.errorsMessages!.push({
      field: "availableResolutions",
      message: "availableResolutions must be a non-empty array",
    });
  } else {
    const validValues = Object.values(VideoResulutionsEnum);
    const isValid = availableResolutions.every((v) => validValues.includes(v));

    if (!isValid) {
      responseError.errorsMessages!.push({
        field: "availableResolutions",
        message:
          "All items in availableResolutions must be valid resolution values",
      });
    }
  }
  if (typeof canBeDownloaded !== "boolean") {
    responseError.errorsMessages!.push({
      field: "canBeDownloaded",
      message: "canBeDownloaded must be a boolean",
    });
  }

  if (
    minAgeRestriction !== null &&
    (typeof minAgeRestriction !== "number" ||
      !Number.isInteger(minAgeRestriction) ||
      minAgeRestriction < 1 ||
      minAgeRestriction > 18)
  ) {
    responseError.errorsMessages!.push({
      field: "minAgeRestriction",
      message: "minAgeRestriction must be null or an integer between 1 and 18",
    });
  }

  if (!isValidDateTimeString(publicationDate)) {
    responseError.errorsMessages!.push({
      field: "publicationDate",
      message: "publicationDate must be a valid ISO 8601 date-time string",
    });
  }

  if (responseError.errorsMessages!.length) {
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
  }

  const videoUpdated = videosRepository.updateVideo(paramId, {
    title,
    author,
    availableResolutions,
    canBeDownloaded,
    minAgeRestriction,
    publicationDate,
  });

  res.sendStatus(
    videoUpdated ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404,
  );
});

videosRouter.delete("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;

  const video = videosRepository.getVideoById(paramId);
  if (!video) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  const deleteSuccessfully = videosRepository.deleteVideoBy(paramId);
  res.sendStatus(
    deleteSuccessfully
      ? HTTP_STATUSES.NO_CONTENT_204
      : HTTP_STATUSES.BAD_REQUEST_400,
  );
});
