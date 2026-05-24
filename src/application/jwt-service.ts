import { IUserBDModel } from "../types/users-model";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET || "secrect";

export const jwtService = {
  async createJWT(user: IUserBDModel) {
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "1h",
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
