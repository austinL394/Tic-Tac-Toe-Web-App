import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import SocketServer from "../../src/socketio/socketServer";

describe("User Service Integration Tests", () => {
  let httpServer: any;
  let ioServer: Server;
  let socketServer: SocketServer;
  let clientSocket: any;
  const JWT_SECRET = process.env.JWT_SECRET;

  const testUser = {
    username: "testuser1",
    firstName: "Test",
    lastName: "User1",
    email: "testuser1@gmail.com",
    password: "XXXXX",
  };

  beforeAll(async () => {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.save(testUser);
  });

  beforeEach((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    socketServer = new SocketServer(ioServer);

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      const token = jwt.sign(testUser, JWT_SECRET);
      
      clientSocket = Client(`http://localhost:${port}`, {
        auth: { token },
      });

      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    ioServer.close();
    clientSocket.close();
    httpServer.close();
  });

  afterAll(async () => {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({
      username: testUser.username,
    });
    await AppDataSource.destroy();
  });

  describe("Authentication", () => {
    it("should connect with valid token", (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    it("should reject connection with invalid token", (done) => {
      const invalidSocket = Client(
        `http://localhost:${(httpServer.address() as any).port}`,
        {
          auth: { token: "invalid_token" },
        }
      );

      invalidSocket.on("connect_error", (err) => {
        expect(err.message).toBe("Invalid authentication token");
        invalidSocket.close();
        done();
      });
    });
  });

  describe("User Status", () => {

    it("should broadcast user list updates", (done) => {
      const safeDone = (() => {
        let isDone = false;
        return (error?: any) => {
          if (!isDone) {
            isDone = true;
            done(error);
          }
        };
      })();

      clientSocket.on("user_list_update", (users) => {
        try {
          expect(users.length).toBeGreaterThanOrEqual(1);
          expect(
            users.find((u: any) => u.username === testUser.username)
          ).toBeTruthy();
          safeDone();
        } catch (error) {
          safeDone(error);
        }
      });
    });
  });
});