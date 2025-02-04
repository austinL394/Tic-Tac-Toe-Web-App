import { Socket } from 'socket.io-client';
import { UserSocketService } from './userSocketService';
import { GameSocketService } from './gameSocketService';

export class MainSocketService {
  private socket: Socket;
  public user: UserSocketService;
  public game: GameSocketService;

  constructor(socket: Socket) {
    this.socket = socket;
    this.user = new UserSocketService(socket);
    this.game = new GameSocketService(socket);
  }

  disconnect() {
    this.socket.disconnect();
  }

  sendHeartbeat() {
    this.socket.emit('heartbeat');
  }
}
