import { IUserDBModel } from "./users-model";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDBModel;
    }
  }
}

export {};
