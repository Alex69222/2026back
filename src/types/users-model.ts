export interface IUserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export class UserDBModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public passwordHash: string,
    public passwordSalt: string,
    public emailConfirmation: {
      confirmationCode: string;
      isConfirmed: boolean;
      expirationDate: Date;
    },
  ) {}
}

export interface ICreateUserModel {
  login: string;
  password: string;
  email: string;
}

export interface IMeModel {
  email: string;
  login: string;
  userId: string;
}
