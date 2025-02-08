import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import SocketServer from "../../src/socketio/socketServer";
import { In } from "typeorm";

describe("Game Service Integration Tests", () => {
  let httpServer: any;
  let ioServer: Server;
  let socketServer: SocketServer;
  let clientSocket1: any;
  let clientSocket2: any;
  const JWT_SECRET = process.env.JWT_SECRET;

  const testUser1 = {
    username: "testuser1",
    firstName: "Test",
    lastName: "User1",
    email: "testuser1@gmail.com",
    password: "XXXXX",
  };

  const testUser2 = {
    username: "testuser2",
    firstName: "Test",
    lastName: "User2",
    email: "testuser2@gmail.com",
    password: "XXXXX",
  };

  beforeAll(async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save([testUser1, testUser2]);
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  });

  beforeEach((done) => {
    const initServer = async () => {
      try {
        httpServer = createServer();
        ioServer = new Server(httpServer);
        socketServer = new SocketServer(ioServer);

        return new Promise<void>((resolve) => {
          httpServer.listen(() => {
            const port = (httpServer.address() as any).port;
            const token1 = jwt.sign(testUser1, JWT_SECRET!);
            const token2 = jwt.sign(testUser2, JWT_SECRET!);

            clientSocket1 = Client(`http://localhost:${port}`, {
              auth: { token: token1 },
              transports: ['websocket'],
              forceNew: true,
            });

            clientSocket2 = Client(`http://localhost:${port}`, {
              auth: { token: token2 },
              transports: ['websocket'],
              forceNew: true,
            });

            let connected = 0;
            const checkDone = () => {
              connected++;
              if (connected === 2) resolve();
            };

            clientSocket1.on("connect", checkDone);
            clientSocket2.on("connect", checkDone);
          });
        });
      } catch (error) {
        console.error('Server initialization error:', error);
        throw error;
      }
    };

    initServer()
      .then(() => done())
      .catch((error) => done(error));
  });

  afterEach((done) => {
    const cleanup = async () => {
      try {
        if (clientSocket1?.connected) {
          clientSocket1.removeAllListeners();
          clientSocket1.disconnect();
        }
        if (clientSocket2?.connected) {
          clientSocket2.removeAllListeners();
          clientSocket2.disconnect();
        }

        return new Promise<void>((resolve) => {
          ioServer.close(() => {
            httpServer.close(() => {
              resolve();
            });
          });
        });
      } catch (error) {
        console.error('Cleanup error:', error);
        throw error;
      }
    };

    cleanup()
      .then(() => done())
      .catch((error) => done(error));
  });

  afterAll(async () => {
    try {
      if (AppDataSource.isInitialized) {
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.delete({
          username: In([testUser1.username, testUser2.username]),
        });
        await AppDataSource.destroy();
      }
    } catch (error) {
      console.error('Database cleanup error:', error);
      throw error;
    }
  });

  describe("Game Room Management", () => {
    it("should create game room", (done) => {
      const safeDone = (() => {
        let isDone = false;
        return (error?: any) => {
          if (!isDone) {
            isDone = true;
            done(error);
          }
        };
      })();

      clientSocket1.emit("game:create_room");

      clientSocket1.on("game:room_created", (room) => {
        try {
          expect(room.status).toBe("waiting");
          expect(room.board).toHaveLength(9);
          safeDone();
        } catch (error) {
          safeDone(error);
        }
      });

      // Add timeout safety
      setTimeout(() => {
        safeDone(new Error('Test timeout: Room creation took too long'));
      }, 5000);
    });

    it("should allow joining existing room", (done) => {
      const safeDone = (() => {
        let isDone = false;
        return (error?: any) => {
          if (!isDone) {
            isDone = true;
            done(error);
          }
        };
      })();

      clientSocket1.emit("game:create_room");

      clientSocket1.once("game:room_created", (room) => {
        clientSocket2.emit("game:join_room", room.id);

        clientSocket2.once("game:room_joined", (joinedRoom) => {
          try {
            expect(joinedRoom.id).toBe(room.id);
            expect(Object.keys(joinedRoom.players)).toHaveLength(2);
            safeDone();
          } catch (error) {
            safeDone(error);
          }
        });
      });

      setTimeout(() => {
        safeDone(new Error('Test timeout: Room joining took too long'));
      }, 5000);
    });
  });

  describe("Game Play", () => {
    it("should handle game moves", (done) => {
      const safeDone = (() => {
        let isDone = false;
        return (error?: any) => {
          if (!isDone) {
            isDone = true;
            done(error);
          }
        };
      })();

      let roomId: string;

      clientSocket1.emit("game:create_room");

      clientSocket1.once("game:room_created", (room) => {
        roomId = room.id;
        clientSocket2.emit("game:join_room", roomId);

        clientSocket2.once("game:room_joined", () => {
          // Both players ready up
        });

        let moveHandler: ((gameRoom: any) => void) | null = null;
        
        const stateHandler = (gameRoom: any) => {
          if (gameRoom.status === "playing") {
            clientSocket1.emit("game:make_move", {
              position: 0,
              roomId: roomId,
            });

            moveHandler = (updatedRoom: any) => {
              try {
                expect(updatedRoom.board[0]).toBe("X");
                clientSocket1.off("game:room_state", moveHandler);
                clientSocket1.off("game:room_state", stateHandler);
                safeDone();
              } catch (error) {
                safeDone(error);
              }
            };

            clientSocket1.on("game:room_state", moveHandler);
          }
        };

        clientSocket1.on("game:room_state", stateHandler);
      });

      setTimeout(() => {
        safeDone(new Error('Test timeout: Game play took too long'));
      }, 5000);
    });
  });
});