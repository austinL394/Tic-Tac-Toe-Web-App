import { Socket } from 'socket.io-client';
import { UserStatus } from '@/types';
import { BaseSocketService } from './baseSocketService';

export class UserSocketService extends BaseSocketService {
  constructor(socket: Socket) {
    super(socket);
  }

  updateUserStatus(status: UserStatus) {
    this.socket.emit('user:status_update', { status });
  }
}
