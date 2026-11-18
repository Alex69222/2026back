import { Request, Response, NextFunction } from 'express';
import { urlAccessRepository } from '../repositories/url-access-repository';
import { HTTP_STATUSES } from '../utils/httpStatuses';

const secondsLimit = 10;
const requestsLimit = 5;

export const apiRestrictionsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip!;
  const url = req.originalUrl;
  const date = new Date();
  const requestsCount = await urlAccessRepository.countAccessCases({ ip, url, date }, secondsLimit);

  if (requestsCount >= requestsLimit) {
    return res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
  }

  await urlAccessRepository.addAccessCase({ ip, url, date });
  next();
};
///sss
