/// <reference types="jest" />
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { runDB, stopDB } from '../../src/repositories/db';
import app, { RouterPaths } from '../../src';
import { ICreateUserModel } from '../../src/types/users-model';
import { usersTestManager } from '../managers/usersTestmanager';
import { validBasicAuthLoginPass } from '../../src/middlewares/auth-middlewares/basic-auth-middleware';
import { HTTP_STATUSES } from '../../src/utils/httpStatuses';
import { IUserActiveSessionViewModel } from '../../src/types/user-active-session-model';

function getRefreshToken(cookie: string): string {
  return cookie.split(';')[0].slice('refreshToken='.length);
}

const createUserData: ICreateUserModel = {
  login: 'Blogger',
  password: 'secret_password',
  email: 'superblogger@gmail.com',
};

const userAgents = [
  'Chrome on Windows',
  'Firefox on Linux',
  'Safari on macOS',
  'Chrome on Android',
];

describe('Auth Sessions', () => {
  let mongoServer: MongoMemoryServer;
  const tokens: { accessToken: string; refreshToken: string }[] = [];
  let activeSessions: IUserActiveSessionViewModel[] = [];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await runDB(uri);

    await request(app).delete(RouterPaths.test_delete);

    await usersTestManager.createUser({
      inputData: createUserData,
      authorizationCredentials: validBasicAuthLoginPass,
    });

    for (const userAgent of userAgents) {
      const response = await request(app)
        .post(RouterPaths.auth + '/login')
        .set('User-Agent', userAgent)
        .send({
          loginOrEmail: createUserData.login,
          password: createUserData.password,
        })
        .expect(HTTP_STATUSES.OK_200);

      const refreshToken = getRefreshToken(response.headers['set-cookie'][0]);
      tokens.push({
        accessToken: response.body.accessToken,
        refreshToken,
      });
    }

    const response = await request(app)
      .get(RouterPaths.sessions)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    activeSessions = response.body;
    // console.log("Активные сессии после логинов:", activeSessions);
  });

  afterAll(async () => {
    await stopDB();
    await mongoServer.stop();
  });

  it('выводит активные сессии', () => {
    // console.log("refresh токены", tokens.map(t => t.refreshToken.split(".")[2]));
    // console.log("Активные сессии в тесте:", activeSessions);
    expect(1).toBe(1);
  });

  it('при вызове /refresh-token обновляется дату активности только первой сессии; id сессий не изменяются', async () => {
    // Поле iat в JWT хранит время с точностью до секунды.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const refreshResponse = await request(app)
      .post(RouterPaths.auth + '/refresh-token')
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    tokens[0] = {
      accessToken: refreshResponse.body.accessToken,
      refreshToken: getRefreshToken(refreshResponse.headers['set-cookie'][0]),
    };

    const response = await request(app)
      .get(RouterPaths.sessions)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    const updatedSessions: IUserActiveSessionViewModel[] = response.body;
    expect(updatedSessions).toHaveLength(activeSessions.length);

    activeSessions.forEach((session, index) => {
      const updatedSession = updatedSessions[index];
      expect(updatedSession.deviceId).toBe(session.deviceId);

      if (index === 0) {
        expect(updatedSession.lastActiveDate).not.toBe(session.lastActiveDate);
      } else {
        expect(updatedSession.lastActiveDate).toBe(session.lastActiveDate);
      }
    });

    // console.log("Активные сессии в тесте2:", updatedSessions);
  });

  it('удаляет вторую сессию с помощью токенов первой сессии', async () => {
    const secondSession = activeSessions[1];

    await request(app)
      .delete(RouterPaths.sessions + '/' + secondSession.deviceId)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const response = await request(app)
      .get(RouterPaths.sessions)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    const nextSessions: IUserActiveSessionViewModel[] = response.body;
    expect(nextSessions).toHaveLength(3);
    expect(nextSessions).not.toContainEqual(
      expect.objectContaining({ deviceId: secondSession.deviceId }),
    );
    // console.log("Активные сессии после удаления:", nextSessions);
  });

  it('удаляет третью сессию после logout третьим устройством', async () => {
    const thirdSession = activeSessions[2];

    await request(app)
      .post(RouterPaths.auth + '/logout')
      .set('Authorization', `Bearer ${tokens[2].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[2].refreshToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const response = await request(app)
      .get(RouterPaths.sessions)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    const nextSessions: IUserActiveSessionViewModel[] = response.body;
    expect(nextSessions).not.toContainEqual(
      expect.objectContaining({ deviceId: thirdSession.deviceId }),
    );
    expect(nextSessions).toHaveLength(2);
    // console.log("Активные сессии после logout третьего устройства:", nextSessions);
  });

  it('удаляет все сессии кроме текущей сессии первого устройства', async () => {
    await request(app)
      .delete(RouterPaths.sessions)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const response = await request(app)
      .get(RouterPaths.sessions)
      .set('Authorization', `Bearer ${tokens[0].accessToken}`)
      .set('Cookie', `refreshToken=${tokens[0].refreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    const nextSessions: IUserActiveSessionViewModel[] = response.body;
    expect(nextSessions).toHaveLength(1);
    expect(nextSessions[0].deviceId).toBe(activeSessions[0].deviceId);
    // console.log("Активные сессии после удаления всех кроме текущей:", nextSessions);
  });
});
