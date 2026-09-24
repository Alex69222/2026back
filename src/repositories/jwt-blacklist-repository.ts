import { jwtBlacklistCollection } from "./db"

export const jwtBlackListRepository = {
    async addJWTtoBlackList (value: string): Promise<boolean> {
      const result =  await jwtBlacklistCollection.insertOne({value});
      return result.acknowledged
    },

    async findJWT(value: string){
        const jwt = await jwtBlacklistCollection.findOne({value});
        return jwt || null;
    },

    async deleteJWTs(): Promise<boolean> {
        const result = await jwtBlacklistCollection.deleteMany({});
        return result.acknowledged;
      },
}