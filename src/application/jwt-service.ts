import { IUserDBModel } from "../types/users-model";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET || "secrect";

export const jwtService = {
  async createJWT(user: IUserDBModel) {
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "10s",
    });
    return token;
  },
  async createRefreshToken(user: IUserDBModel){
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "20s",
    });
    return token;
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
