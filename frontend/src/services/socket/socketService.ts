// src/socket/socketService.ts
import { Socket } from 'socket.io-client';
import { UserStatus } from '@/types';

export class SocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // Connection methods
  disconnect() {
    this.socket.disconnect();
  }

  // User methods
  updateUserStatus(status: UserStatus) {
    this.socket.emit('user:status_update', { status });
  }

  sendHeartbeat() {
    this.socket.emit('heartbeat');
  }

  // Game methods
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

  // Chat methods (if needed)
  sendMessage(roomId: string, message: string) {
    this.socket.emit('chat:message', { roomId, message });
  }
}
