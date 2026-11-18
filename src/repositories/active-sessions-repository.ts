import { userActiveSessionsCollection } from './db';
import {
  IUserActiveSessionModel,
  IUserActiveSessionViewModel,
} from '../types/user-active-session-model';

export const activeSessionsRepository = {
  async addActiveSession(sessionData: IUserActiveSessionModel): Promise<boolean> {
    const result = await userActiveSessionsCollection.insertOne(sessionData);
    return result.acknowledged;
  },
  async findActiveSession(
    userId: string,
    deviceId: string,
    lastActiveDate: number,
  ): Promise<IUserActiveSessionModel | null> {
    const session = await userActiveSessionsCollection.findOne({
      userId,
      deviceId,
      lastActiveDate: new Date(lastActiveDate * 1000).toISOString(),
    });
    return session;
  },
  async findAllUserSessions(userId: string): Promise<IUserActiveSessionViewModel[]> {
    const sessions = await userActiveSessionsCollection.find({ userId }).toArray();
    return sessions.map(({ ip, title, lastActiveDate, deviceId }) => ({
      ip: ip ?? '',
      title: title ?? '',
      lastActiveDate,
      deviceId,
    }));
  },
  async updateActiveSession(sessionData: IUserActiveSessionModel): Promise<boolean> {
    const { userId, deviceId, ip, title, ...sessionFields } = sessionData;
    const result = await userActiveSessionsCollection.updateOne(
      { userId, deviceId },
      {
        $set: {
          ...sessionFields,
          ...(ip !== undefined ? { ip } : {}),
          ...(title !== undefined ? { title } : {}),
        },
      },
    );
    return result.modifiedCount === 1;
  },
  async deleteOneUserSession(
    userId: string,
    deviceId: string,
  ): Promise<'deleted' | 'notFound' | 'forbidden'> {
    const session = await userActiveSessionsCollection.findOne({ deviceId });
    if (!session) return 'notFound';
    if (session.userId !== userId) return 'forbidden';

    const result = await userActiveSessionsCollection.deleteOne({ userId, deviceId });
    return result.deletedCount === 1 ? 'deleted' : 'notFound';
  },
  async deleteRestUserSessions(userId: string, deviceId: string): Promise<boolean> {
    const result = await userActiveSessionsCollection.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
    return result.acknowledged;
  },
  async clearCollection(): Promise<boolean> {
    const result = await userActiveSessionsCollection.deleteMany();
    return result.acknowledged;
  },
};
