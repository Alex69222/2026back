import { Router, Request, Response } from "express";
import { IVideo, VideoResulutionsEnum } from "./video-model";
import { IAPIErrorResult } from "../../types/error/api-error";
import { isValidDateTimeString } from "../../utils/isValidDateTimeString";
import { dataBase } from "../../repository/memoryDB";
import { addDays } from "date-fns";
import { HTTP_STATUSES } from "../../utils/httpStatuses";

export const videosRouter = Router();

videosRouter.get("/", (req: Request, res: Response) => {
  res.send(dataBase.videos);
});

videosRouter.get("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const video = dataBase.videos.find((v) => v.id === paramId);
  if (!video) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  res.send(video);
});

videosRouter.post("/", (req: Request, res: Response) => {
  const responseError: IAPIErrorResult = {
    errorsMessages: [],
  };

  const title: string = req.body.title;
  const author: string = req.body.author;
  const availableResolutions = req.body.availableResolutions;
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

  if (responseError.errorsMessages!.length) {
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
  }
  const date = new Date();
  const video: IVideo = {
    id: +date,
    title,
    author,
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: date.toISOString(),
    publicationDate: addDays(date, 1).toISOString(),
    availableResolutions,
  };
  dataBase.videos.push(video);
  res.status(HTTP_STATUSES.CREATED_201).send(video);
});

videosRouter.put("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const video = dataBase.videos.find((v) => v.id === paramId);
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

  video.title = title;
  video.author = author;
  video.availableResolutions = availableResolutions;
  video.canBeDownloaded = canBeDownloaded;
  video.minAgeRestriction = minAgeRestriction;
  video.publicationDate = publicationDate;

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

videosRouter.delete("/:id", (req: Request, res: Response) => {
  const paramId = +req.params.id;
  const videoIndex = dataBase.videos.findIndex((v) => v.id === paramId);
  if (videoIndex === -1) return res.sendStatus(404);
  dataBase.videos.splice(videoIndex, 1);
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
