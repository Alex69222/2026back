import { Router, Request, Response } from "express";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { videosRepository } from "../repositories/videos-repository";
import { matchedData } from "express-validator";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import {
  validateVideoAuthorMiddleware,
  validateVideoCanBeDownloadedMiddleware,
  validateVideoMinAgeRestrictionMiddleware,
  validateVideoPublicationDateMiddleware,
  validateVideoResolutionsMiddleware,
  validateVideoTitleMiddleware,
} from "../middlewares/video-model-middlewares";
import {
  ICreateVideoInputModel,
  IUpdateVideoInputModel,
} from "../types/video-model";

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
  validateVideoTitleMiddleware,
  validateVideoAuthorMiddleware,
  validateVideoResolutionsMiddleware,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const data: ICreateVideoInputModel = matchedData(req);

    const video = videosRepository.addVideo({
      title: data.title,
      author: data.author,
      availableResolutions: data.availableResolutions,
    });
    res.status(HTTP_STATUSES.CREATED_201).send(video);
  },
);

videosRouter.put(
  "/:id",
  validateVideoTitleMiddleware,
  validateVideoAuthorMiddleware,
  validateVideoResolutionsMiddleware,
  validateVideoCanBeDownloadedMiddleware,
  validateVideoMinAgeRestrictionMiddleware,
  validateVideoPublicationDateMiddleware,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const paramId = +req.params.id;
    const video = videosRepository.getVideoById(paramId);
    if (!video) return res.sendStatus(404);

    const data: IUpdateVideoInputModel = matchedData(req);

    const videoUpdated = videosRepository.updateVideo(paramId, {
      title: data.title,
      author: data.author,
      availableResolutions: data.availableResolutions,
      canBeDownloaded: data.canBeDownloaded,
      minAgeRestriction: data.minAgeRestriction,
      publicationDate: data.publicationDate,
    });

    res.sendStatus(
      videoUpdated ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404,
    );
  },
);

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
