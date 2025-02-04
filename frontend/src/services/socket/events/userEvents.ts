import { Socket } from 'socket.io-client';
import { OnlineUser, UserEventHandlers, UserStatus } from '@/types';

export const setupUserEvents = (socket: Socket, { setOnlineUsers, setCurrentSession, user }: UserEventHandlers) => {
  socket.on('user_list_update', (users: OnlineUser[]) => {
    setOnlineUsers(users);
  });

  socket.on('user:status_changed', (data: { userId: string; status: UserStatus }) => {
    setOnlineUsers((prevUsers) =>
      prevUsers.map((user) => (user.userId === data.userId ? { ...user, status: data.status } : user)),
    );

    if (data.userId === user?.id) {
      setCurrentSession((prev) => (prev ? { ...prev, status: data.status, lastActivity: new Date() } : null));
    }
  });

  return () => {
    socket.off('user_list_update');
    socket.off('user:status_changed');
  };
};
