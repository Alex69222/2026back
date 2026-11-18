import { Router, Request, Response } from 'express';
import { jwtCookieMiddleware } from '../middlewares/auth-middlewares/jwt-cookie-middleware';
import { activeSessionsRepository } from '../repositories/active-sessions-repository';
import { HTTP_STATUSES } from '../utils/httpStatuses';
import { jwtService } from '../application/jwt-service';

export const sessionsRouter = Router();

sessionsRouter.get('/', jwtCookieMiddleware, async (req: Request, res: Response) => {
  const sessionData = await jwtService.getSessionDataByToken(req.cookies.refreshToken);
  if (!sessionData) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);

  const sessions = await activeSessionsRepository.findAllUserSessions(sessionData.userId);
  return res.status(HTTP_STATUSES.OK_200).send(sessions);
});

sessionsRouter.delete('/', jwtCookieMiddleware, async (req: Request, res: Response) => {
  const sessionData = await jwtService.getSessionDataByToken(req.cookies.refreshToken);
  if (!sessionData) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);

  await activeSessionsRepository.deleteRestUserSessions(sessionData.userId, sessionData.deviceId);
  return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

sessionsRouter.delete('/:deviceId', jwtCookieMiddleware, async (req: Request, res: Response) => {
  const sessionData = await jwtService.getSessionDataByToken(req.cookies.refreshToken);
  if (!sessionData) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);

  const deviceId = req.params.deviceId.toString();
  const result = await activeSessionsRepository.deleteOneUserSession(sessionData.userId, deviceId);

  switch (result) {
    case 'notFound':
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    case 'forbidden':
      return res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
    case 'deleted':
      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  }
});
