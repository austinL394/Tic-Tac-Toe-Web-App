// src/services/baseService.ts
import { Server as SocketIOServer } from "socket.io";
import { SharedStore } from "../store/sharedStore";

export abstract class BaseService {
  protected io: SocketIOServer;
  protected store: SharedStore;
  protected serviceName: string;

  constructor(io: SocketIOServer, serviceName: string) {
    this.io = io;
    this.store = SharedStore.getInstance();
    this.serviceName = serviceName;
  }

  protected log(message: string, ...args: any[]) {
    console.log(`[${this.serviceName}] ${message}`, ...args);
  }

  protected error(message: string, ...args: any[]) {
    console.error(`[${this.serviceName}] Error: ${message}`, ...args);
  }
}
