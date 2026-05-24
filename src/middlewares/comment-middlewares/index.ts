import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { commentsQueryRepository } from "../../repositories/comments-query-repository";
import { HTTP_STATUSES } from "../../utils/httpStatuses";

export const validateCommentContentMiddleware = body("content")
  .isString()
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage(`Content length should be from 20 to 300 symbols.`);

export const validateCommentExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = req.params.id.toString();
  const comment = await commentsQueryRepository.getCommentById(paramId);

  if (!comment) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  next();
};

export const validateUserHasRightsToOperateWithTheCommentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = req.params.id.toString();
  const comment = await commentsQueryRepository.getCommentById(paramId);
  const user = req?.user;

  if (user?.id !== comment?.commentatorInfo?.userId) {
    return res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
  }

  next();
};
