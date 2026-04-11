import { Request, Response, Router } from "express";
import { IAPIErrorResult } from "../../types/error/api-error";
import { dataBase } from "../../repository/memoryDB";
import { HTTP_STATUSES } from "../../utils/httpStatuses";
import { IAuthorVideoBinging } from "./authors-videos-bindings-model";

export const authorsVideosBindingsRouter = Router();

authorsVideosBindingsRouter.post("/", async (req: Request, res: Response) => {
  const responseError: IAPIErrorResult = {
    errorsMessages: [],
  };
  const videoId = +req.body.videoId;
  const authorId = +req.body.authorId;
  if (!videoId || Number.isNaN(videoId)) {
    responseError.errorsMessages?.push({
      field: "videoId",
      message: "Video id was not provided",
    });
  }
  if (!authorId || Number.isNaN(authorId)) {
    responseError.errorsMessages?.push({
      field: "authorId",
      message: "Author id was not provided",
    });
  }
  if (responseError.errorsMessages!.length) {
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
  }
  const video = dataBase.videos.find((v) => v.id === videoId);
  const author = dataBase.authors.find((a) => a.id === authorId);
  let notFoundMessage: string = "";
  if (!video) {
    notFoundMessage += "Video not found. ";
  }
  if (!author) {
    notFoundMessage += "Author not found. ";
  }
  if (notFoundMessage.length) {
    return res.status(HTTP_STATUSES.NOT_FOUND_404).send(notFoundMessage);
  }
  const bindingExists = dataBase.authorVideoBindings.find(
    (b) => b.authorId === author?.id && b.videoId === video?.id,
  );
  if (bindingExists) {
    return res
      .status(HTTP_STATUSES.BAD_REQUEST_400)
      .json({ message: "Binding already exists" });
  }
  const createdBinding: IAuthorVideoBinging = {
    authorId,
    videoId,
    date: new Date().toISOString(),
  };
  dataBase.authorVideoBindings.push(createdBinding);

  return res.status(HTTP_STATUSES.CREATED_201).send(createdBinding);
});
