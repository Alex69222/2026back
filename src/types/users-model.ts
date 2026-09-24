export interface IUserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}
export interface IUserDBModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  passwordSalt: string;
  emailConfirmation: {
    confirmationCode: string;
    isConfirmed: boolean;
    expirationDate: Date;
  };
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
