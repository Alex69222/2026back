import { urlAccessCollection } from './db';
import { IURLAccessModel } from '../types/url-access-model';

export const urlAccessRepository = {
  async addAccessCase(accessData: IURLAccessModel): Promise<boolean> {
    const result = await urlAccessCollection.insertOne(accessData);
    return result.acknowledged;
  },
  async countAccessCases(accessData: IURLAccessModel, seconds: number): Promise<number> {
    const now = new Date(accessData.date.getTime() - seconds * 1000);
    return urlAccessCollection.countDocuments({
      ip: accessData.ip,
      url: accessData.url,
      date: { $gte: now },
    });
  },
  async clearAccessData(): Promise<boolean> {
    const result = await urlAccessCollection.deleteMany();
    return result.acknowledged;
  },
};
