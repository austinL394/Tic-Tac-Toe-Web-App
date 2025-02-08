import { Socket } from 'socket.io-client';
import { BaseSocketService } from './baseSocketService';
import toast from 'react-hot-toast';

export class GameSocketService extends BaseSocketService {
  constructor(socket: Socket) {
    super(socket);
  }

  createRoom(name: string) {
    this.socket.emit('game:create_room', name);
  }

  handleGameJoinRequestResponse = (roomId: string, acceptOrDecline: boolean) => {
    if (acceptOrDecline) {
      this.joinRoom(roomId);
    } else {
      toast.error('Join room rejected');
    }
  };

  getRoomList() {
    this.socket.emit('game:room_list');
  }
  
  requestJoinRoom(roomId: string) {
    this.socket.emit('game:request_join_room', roomId);
  }

  joinRoom(roomId: string) {
    this.socket.emit('game:join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket.emit('game:room_leave', roomId);
  }

  makeMove(roomId: string, position: number) {
    this.socket.emit('game:make_move', { roomId, position });
  }

  updateCode(codeString: string) {
    this.socket.emit('game:update_content', codeString);
  }

  kickPlayer(roomId: string, userId: string) {
    this.socket.emit('game:kick_player', roomId, userId);
  }

  handleGameJoinRequest(roomId: string, userId: string, acceptOrDecline: boolean) {
    this.socket.emit('game:join_request_reply', roomId, userId, acceptOrDecline);
  }
}
