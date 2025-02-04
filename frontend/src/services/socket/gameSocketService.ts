import { Socket } from 'socket.io-client';
import { BaseSocketService } from './baseSocketService';

export class GameSocketService extends BaseSocketService {
  constructor(socket: Socket) {
    super(socket);
  }

  createRoom() {
    this.socket.emit('game:create_room');
  }

  getRoomList() {
    this.socket.emit('game:room_list');
  }

  joinRoom(roomId: string) {
    this.socket.emit('game:join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket.emit('game:room_leave', roomId);
  }

  toggleReady(roomId: string) {
    this.socket.emit('game:toggle_ready', roomId);
  }

  makeMove(roomId: string, position: number) {
    this.socket.emit('game:make_move', { roomId, position });
  }

  requestRematch(roomId: string) {
    this.socket.emit('game:request_rematch', { roomId });
  }
}
