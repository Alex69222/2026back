import { Request, Response, Router } from "express";
import { commentsQueryRepository } from "../repositories/comments-query-repository";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { jwtAuthMiddleware } from "../middlewares/auth-middlewares/jwt-auth-middleware";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import {
  validateCommentContentMiddleware,
  validateCommentExistsMiddleware,
  validateUserHasRightsToOperateWithTheCommentMiddleware,
} from "../middlewares/comment-middlewares";
import { commentsService } from "../domain/comments-service";
import { unexpectedErrorMsgJson } from "../utils/errors";

export const commentsRouter = Router();

commentsRouter.get("/:id", async (req: Request, res: Response) => {
  const commentId = req.params.id.toString();
  const comment = await commentsQueryRepository.getCommentById(commentId);
  if (!comment) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  res.send(comment);
});

commentsRouter.put(
  "/:id",
  jwtAuthMiddleware,
  validateCommentExistsMiddleware,
  validateUserHasRightsToOperateWithTheCommentMiddleware,
  validateCommentContentMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const commentId = req.params.id.toString();
    const commentUpdated = await commentsService.updateComment(
      commentId,
      req.body.content,
    );

    commentUpdated
      ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.status(HTTP_STATUSES.BAD_REQUEST_400).json(unexpectedErrorMsgJson);
  },
);

commentsRouter.delete(
  "/:id",
  jwtAuthMiddleware,
  validateCommentExistsMiddleware,
  validateUserHasRightsToOperateWithTheCommentMiddleware,
  async (req: Request, res: Response) => {
    const commentId = req.params.id.toString();

    const deleted = await commentsService.deleteBCommentById(commentId);

    deleted
      ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.status(HTTP_STATUSES.BAD_REQUEST_400).json(unexpectedErrorMsgJson);
  },
);
