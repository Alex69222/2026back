import { Request, Response, Router } from "express";
import {
  validateLoginOrEmailMiddleware,
  validateUserLoginMiddleware,
  validateUserPasswordMiddleware,
} from "../middlewares/users-middlewares";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { usersService } from "../domain/users-service";
import { HTTP_STATUSES } from "../utils/httpStatuses";

export const authRouter = Router();

authRouter.post(
  "/login",
  validateLoginOrEmailMiddleware,
  validateUserPasswordMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const success = await usersService.checkCredentials(
      req.body.loginOrEmail,
      req.body.password,
    );
    res.sendStatus(
      success ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.UNAUTHORIZED_401,
    );
  },
);
