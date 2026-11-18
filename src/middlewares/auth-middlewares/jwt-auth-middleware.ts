import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES } from '../../utils/httpStatuses';
import { jwtService } from '../../application/jwt-service';
import { usersService } from '../../domain/users-service';

export const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log('authorization header: ', req.headers.authorization);
  if (!req.headers.authorization) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  const token = req.headers.authorization.split(' ')[1];
  const userId = await jwtService.getUserIdByToken(token);
  console.log('userId: ', userId);
  if (!userId) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }

  req.user = (await usersService.getUserById(userId))!;

  next();
};
