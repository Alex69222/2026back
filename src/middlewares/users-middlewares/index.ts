import { NextFunction, Request, Response } from "express";
import { body, oneOf } from "express-validator";
import { usersQueryRepository } from "../../repositories/users-query-repository";
import { HTTP_STATUSES } from "../../utils/httpStatuses";

export const validateUserLoginMiddleware = body("login")
  .isString()
  .trim()
  .isLength({ min: 3, max: 10 })
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage("user login should be 3 to 15 letters or numbers");

export const validateUserPasswordMiddleware = body("password")
  .isString()
  .trim()
  .isLength({ min: 6, max: 20 });

export const validateUserEmailMiddleware = body("email")
  .isString()
  .trim()
  .isEmail();

export const validateUserExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = req.params.id.toString();
  const user = await usersQueryRepository.findUserByFilter({ id: paramId });

  if (!user) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  next();
};

export const validateLoginOrEmailMiddleware = oneOf(
  [
    body("loginOrEmail")
      .isString()
      .trim()
      .isLength({ min: 3, max: 10 })
      .matches(/^[a-zA-Z0-9_-]*$/)
      .withMessage("login должен быть 3-10 символов: буквы, цифры, _, -"),

    body("loginOrEmail")
      .isString()
      .trim()
      .isEmail()
      .withMessage("неверный email"),
  ],
  {
    message: "loginOrEmail должен быть валидным логином или email",
  },
);
