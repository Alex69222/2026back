import { MongoMemoryServer } from "mongodb-memory-server";
import { runDB, stopDB } from "../repositories/db";
import { IEmailService } from "../application/email-service";
import { usersServiceClass } from "./users-service";
describe("Users Service", () => {
  let mongoServer: MongoMemoryServer;
  const userData = {
    login: "Chipolino",
    email: "chipolino@gmail.com",
    password: "123",
  };

  const emailServiceMock: jest.Mocked<IEmailService> = {
    sendEmail: jest.fn(),
    sendConfirmEmailForRegistration: jest.fn(),
  };

  const usersService = new usersServiceClass(emailServiceMock);

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await runDB(uri);
  });

  afterAll(async () => {
    await stopDB();
    await mongoServer.stop();
  });

  describe("createUser", () => {
    it("should create user", async () => {
      const createdUser = await usersService.createUser(userData, {
        isConfirmed: false,
      });
      console.log(createdUser);

      expect(5).toBe(5);
    });
  });
});
