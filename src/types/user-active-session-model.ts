export interface IUserActiveSessionModel {
  userId: string;
  deviceId: string; // выполняет роль идентификатора сессии
  ip?: string;
  title?: string;
  lastActiveDate: string;
  expirationDate: string;
}

export interface IUserActiveSessionViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}
