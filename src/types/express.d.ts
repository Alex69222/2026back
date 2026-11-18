import { UserDBModel } from './users-model';

declare global {
  namespace Express {
    interface Request {
      user?: UserDBModel;
    }
  }
}

export {};
