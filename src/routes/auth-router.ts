import { Request, Response, Router } from "express";
import {
  validateLoginOrEmailMiddleware,
  validateUserPasswordMiddleware,
} from "../middlewares/users-middlewares";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { usersService } from "../domain/users-service";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { jwtService } from "../application/jwt-service";
import { jwtAuthMiddleware } from "../middlewares/auth-middlewares/jwt-auth-middleware";
import { IMeModel } from "../types/users-model";

export const authRouter = Router();

authRouter.post(
  "/login",
  validateLoginOrEmailMiddleware,
  validateUserPasswordMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const user = await usersService.checkCredentials(
      req.body.loginOrEmail,
      req.body.password,
    );

    if (!user) {
      return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    } else {
      const token = await jwtService.createJWT(user);
      res.status(HTTP_STATUSES.OK_200).send({ accessToken: token });
    }
  },
);

authRouter.get(
  "/me",
  jwtAuthMiddleware,
  async (req: Request, res: Response) => {
    const me: IMeModel = {
      login: req.user!.login,
      email: req.user!.email,
      userId: req.user!.id,
    };
    res.status(HTTP_STATUSES.OK_200).send(me);
  },
);
