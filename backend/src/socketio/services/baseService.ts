import { Server as SocketIOServer } from "socket.io";
import { SharedStore } from "../store/sharedStore";

export abstract class BaseService {
  protected store: SharedStore;

  constructor(protected io: SocketIOServer) {
    this.store = SharedStore.getInstance();
  }
}
