import { NextFunction, Request, Response } from "express";
import { HTTP_STATUSES } from "../../utils/httpStatuses";

export const validBasicAuthLoginPass =
  "Basic " + Buffer.from("admin:qwerty", "utf-8").toString("base64");

export const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || authHeader !== validBasicAuthLoginPass) {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ message: "Unauthorized" });
  }

  next();
};
