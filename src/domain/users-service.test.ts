/// <reference types="jest" />
import { MongoMemoryServer } from "mongodb-memory-server";
import { runDB, stopDB, usersCollection } from "../repositories/db";
import { IEmailService } from "../application/email-service";
import { usersServiceClass } from "./users-service";
import { addMinutes } from "date-fns";
import { ObjectId } from "mongodb";
import { usersRepository } from "../repositories/users-repository";
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
      expect(emailServiceMock.sendConfirmEmailForRegistration).toHaveBeenCalled();
      expect(createdUser[0]).toBe(true);
    });

    it("should not create user with occupied email", async () =>{
       const createdUser = await usersService.createUser({...userData, login: "unused_login"}, {
        isConfirmed: false,
      });
      
      expect(createdUser[0]).toBe(false);
    });

     it("should not create user with occupied login", async () =>{
       const createdUser = await usersService.createUser({...userData, email: "unusedemail@mail.com"}, {
        isConfirmed: false,
      });
      
      expect(createdUser[0]).toBe(false);
    })
  });

  describe("confirmEmail", () => {
      const updateConfirmationSpy = jest.spyOn(usersRepository, "updateConfirmation");

beforeEach(() => {
  jest.clearAllMocks();
});
    const createUser = (login:string, email: string, confirmationCode: string, expirationDate: Date) => ({
      id: new ObjectId().toString(),
        login,
        email,
        createdAt: new Date().toString(),
        passwordHash: "hash",
        passwordSalt: "salt",
        emailConfirmation: {
          confirmationCode,
          isConfirmed: false,
          expirationDate,
        }
    })
    it("should not confirm while expiration date is expired", async () => {

      const confCode = "supercode"
      await usersCollection.insertOne(createUser("login", "em@mail.com", confCode,addMinutes(new Date(), -1)))
      const confirmation = await usersService.confirmEmail(confCode);
      
      expect(updateConfirmationSpy).not.toHaveBeenCalled();
      expect(confirmation[0]).toBe(false)
    });

     it("should  confirm email", async () => {

      const confCode = "supercode2";
      const nextUser =  createUser("login2", "em2@mail.com", confCode, addMinutes(new Date(), 30));

      await usersCollection.insertOne(nextUser);
      const confirmation = await usersService.confirmEmail(confCode);
      expect(confirmation[0]).toBe(true)

      const usr = await usersService.getUserById(nextUser.id);
      expect(updateConfirmationSpy).toHaveBeenCalled();
      expect(usr?.emailConfirmation.isConfirmed).toBe(true)
      
    });


    it("should not confirm email by unexisting code", async () => {

      const confCode = "unexisting_code"
    
      const confirmation = await usersService.confirmEmail(confCode);
      expect(updateConfirmationSpy).not.toHaveBeenCalled();
      expect(confirmation[0]).toBe(false)

      
    });

   



  })
});
