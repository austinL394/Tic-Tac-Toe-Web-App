import { Server as SocketIOServer } from "socket.io";
import { SharedStore } from "../store/sharedStore";
import { ServiceRegistry } from "../serviceRegistry";

export abstract class BaseService {
  protected store: SharedStore;

  constructor(protected io: SocketIOServer, serviceName: string) {
    this.store = SharedStore.getInstance();
    this.registerService(serviceName);
  }

  private registerService(serviceName: string) {
    ServiceRegistry.getInstance().register(serviceName, this);
  }
}