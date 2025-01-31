import classNames from 'classnames';
import { PropsWithChildren, ReactNode } from 'react';

interface Props {
  content: ReactNode | string;
  position?: 'top' | 'bottom' | 'right';
  width?: number;
}

const Tooltip = ({ children, position = 'bottom', width, content }: PropsWithChildren<Props>) => {
  return (
    <div className="tt">
      {children}
      <span
        className={classNames('tt-text bg-white text-black rounded-[5px] text-xs', {
          'tt-pos-bottom': position === 'bottom',
          'tt-pos-top': position === 'top',
          'tt-pos-right': position === 'right',
        })}
        style={{
          minWidth: width,
        }}
      >
        {content}
      </span>
    </div>
  );
};

export default Tooltip;
