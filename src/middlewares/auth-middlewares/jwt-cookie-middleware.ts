import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES } from '../../utils/httpStatuses';
import { jwtService } from '../../application/jwt-service';
import { activeSessionsRepository } from '../../repositories/active-sessions-repository';

export const jwtCookieMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.refreshToken) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  const token = req.cookies.refreshToken;
  const activeSessionData = await jwtService.getSessionDataByToken(token);

  if (!activeSessionData) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  const session = await activeSessionsRepository.findActiveSession(
    activeSessionData.userId,
    activeSessionData.deviceId,
    activeSessionData.lastActiveDate,
  );

  if (!session) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  next();
};
