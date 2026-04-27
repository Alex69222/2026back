import { Request, Response, Router } from "express";
import {
  validateUserEmailMiddleware,
  validateUserExistsMiddleware,
  validateUserLoginMiddleware,
  validateUserPasswordMiddleware,
} from "../middlewares/users-middlewares";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { usersService } from "../domain/users-service";
import { usersQueryRepository } from "../repositories/users-query-repository";
import { HTTP_STATUSES } from "../utils/httpStatuses";
import { IUserViewModel } from "../types/users-model";
import { basicAuthMiddleware } from "../middlewares/auth-middlewares/basic-auth-middleware";
import { IAPIErrorResult } from "../types/error/api-error";
import { qpNormalizer } from "../utils/qpNormalizer";

export const usersRouter = Router();

usersRouter.post(
  "/",
  basicAuthMiddleware,
  validateUserLoginMiddleware,
  validateUserPasswordMiddleware,
  validateUserEmailMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response<IUserViewModel | IAPIErrorResult>) => {
    const createdUserData = await usersService.createUser({
      login: req.body.login,
      email: req.body.email,
      password: req.body.password,
    });

    if (!createdUserData[0]) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).send(createdUserData[1]);
    }

    const user = await usersQueryRepository.findUserByFilter({
      id: createdUserData[1] as string,
    });
    res.status(HTTP_STATUSES.CREATED_201).send(user!);
  },
);

usersRouter.get(
  "/",
  basicAuthMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const normalizedQp = qpNormalizer(req.query);
    const blogs = await usersQueryRepository.getUsers(normalizedQp);
    res.send(blogs);
  },
);

usersRouter.delete(
  "/:id",
  basicAuthMiddleware,
  validateUserExistsMiddleware,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const paramId = req.params.id.toString();

    const deleted = await usersService.deleteUserById(paramId);

    res.sendStatus(
      deleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.BAD_REQUEST_400,
    );
  },
);
