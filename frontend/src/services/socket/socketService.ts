import { Socket } from 'socket.io-client';
import { UserStatus } from '@/types';

export class SocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  disconnect() {
    this.socket.disconnect();
  }

  updateUserStatus(status: UserStatus) {
    this.socket.emit('user:status_update', { status });
  }

  sendHeartbeat() {
    this.socket.emit('heartbeat');
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
}
