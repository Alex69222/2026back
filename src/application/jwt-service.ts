import { IUserDBModel } from "../types/users-model";
import { IUserActiveSessionModel } from "../types/user-active-session-model";
import { activeSessionsRepository } from "../repositories/active-sessions-repository";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
const jwtSecret = process.env.JWT_SECRET || "secrect";

export const jwtService = {
  async createJWT(user: IUserDBModel) {
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "10s",
    });
    return token;
  },
  async createRefreshToken({ user, deviceId, ip, title }: {
    user: IUserDBModel;
    deviceId?: string;
    ip?: string;
    title?: string;
  }) {
    const isNewSession = !deviceId;
    deviceId ||= uuidv4();
    const token = jwt.sign({ userId: user.id, deviceId }, jwtSecret, {
      expiresIn: "20s",
    });
    const { iat, exp } = jwt.decode(token) as { iat: number; exp: number };
    const sessionData: IUserActiveSessionModel = {
      userId: user.id,
      deviceId,
      ip,
      title,
      lastActiveDate: new Date(iat * 1000).toISOString(),
      expirationDate: new Date(exp * 1000).toISOString(),
    };
    if (isNewSession) {
      await activeSessionsRepository.addActiveSession(sessionData);
    } else {
      await activeSessionsRepository.updateActiveSession(sessionData);
    }
    return token;
  },

  async getSessionDataByToken(
    token: string,
  ): Promise<{ userId: string; deviceId: string; lastActiveDate: number } | null> {
    try {
      const result = jwt.verify(token, jwtSecret);
      if (
        typeof result === "string" ||
        typeof result.userId !== "string" ||
        typeof result.deviceId !== "string" ||
        typeof result.iat !== "number"
      ) {
        return null;
      }
      return { userId: result.userId, deviceId: result.deviceId, lastActiveDate: result.iat };
    } catch (error) {
      return null;
    }
  },

  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const result: any = jwt.verify(token, jwtSecret);

      return result.userId;
    } catch (error) {
      return null;
    }
  },
};
