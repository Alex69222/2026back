export interface IUserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}
export interface IUserBDModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  passwordSalt: string;
}

export interface ICreateUserModel {
  login: string;
  password: string;
  email: string;
}
