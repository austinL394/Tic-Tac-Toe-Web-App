import { Socket } from 'socket.io-client';

export class BaseSocketService {
  protected socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  disconnect() {
    this.socket.disconnect();
  }
}
