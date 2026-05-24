import { IUserBDModel } from "./users-model";

declare global {
  namespace Express {
    interface Request {
      user?: IUserBDModel;
    }
  }
}

export {};
