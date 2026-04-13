import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { IAPIErrorResult } from "../types/error/api-error";
import { HTTP_STATUSES } from "../utils/httpStatuses";

export const inputValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const responseError: IAPIErrorResult = {
      errorsMessages: errors
        .array()

        .map((er) => {
          return er.type === "field"
            ? { field: er.path, message: er.msg }
            : { field: "", message: er.msg };
        }),
    };
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(responseError);
  }
  next();
};
