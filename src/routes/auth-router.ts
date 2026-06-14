import { Request, Response, Router } from "express";
import {
  validateLoginOrEmailMiddleware,
  validateUserEmailMiddleware,
  validateUserLoginMiddleware,
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

authRouter.post(
  "/registration",
  validateUserLoginMiddleware,
  validateUserPasswordMiddleware,
  validateUserEmailMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const createdUserData = await usersService.createUser(
      {
        login: req.body.login,
        email: req.body.email,
        password: req.body.password,
      },
      { isConfirmed: false },
    );

    if (!createdUserData[0]) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(createdUserData[1]);
    }
    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  },
);

authRouter.post(
  "/registration-confirmation",
  async (req: Request, res: Response) => {
    const confirmedData = await usersService.confirmEmail(req.body.code);
    if (!confirmedData[0]) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(confirmedData[1]);
    }
    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  },
);

authRouter.post(
  "/registration-email-resending",
  validateUserEmailMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const resentData = await usersService.resendConfirmationEmail(
      req.body.email,
    );
    if (!resentData[0]) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(resentData[1]);
    }
    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  },
);
