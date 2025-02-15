import classNames from 'classnames';
import { UserStatus } from '@/types';

const StatusIndicator = ({ status }: { status: UserStatus }) => (
  <div className="relative flex items-center justify-center">
    <div
      className={classNames('absolute w-2.5 h-2.5 rounded-[50%] opacity-75 animate-ping', {
        'bg-green-500': status === UserStatus.ONLINE,
        'bg-yellow-500': status === UserStatus.BUSY,
        'bg-red-500': status === UserStatus.INGAME,
      })}
    />
    <div
      className={classNames('relative w-2.5 h-2.5 rounded-[50%]', {
        'bg-green-500': status === UserStatus.ONLINE,
        'bg-yellow-500': status === UserStatus.BUSY,
        'bg-red-500': status === UserStatus.INGAME,
      })}
    />
  </div>
);

export default StatusIndicator;
