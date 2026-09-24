import { NextFunction, Request, Response } from "express";
import { HTTP_STATUSES } from "../../utils/httpStatuses";
import { jwtService } from "../../application/jwt-service";
import { jwtBlackListRepository } from "../../repositories/jwt-blacklist-repository";

export const jwtCookieMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  if (!req.cookies.refreshToken) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  const token = req.cookies.refreshToken;
  const userId = await jwtService.getUserIdByToken(token);
  const tokenIsInBlackList = await jwtBlackListRepository.findJWT(token);

  if (!userId || tokenIsInBlackList) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  next();
};