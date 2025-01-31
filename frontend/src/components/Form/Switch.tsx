import classNames from 'classnames';
import { useState } from 'react';

type SwitchProps = {
  initialToggle: boolean;
  onToggleChange: (newState: boolean) => void;
};

function Switch({ initialToggle, onToggleChange }: SwitchProps) {
  const [toggle, setToggle] = useState(initialToggle);

  const handleToggle = async () => {
    const curToggleState = !toggle;
    setToggle(curToggleState);

    await onToggleChange(curToggleState);
  };

  return (
    //   Switch Container
    <div
      className={classNames('w-12 h-5 flex items-center rounded-full py-2 px-1 cursor-pointer', {
        'bg-[#1F6C99]': toggle,
        'bg-gray-300': !toggle,
      })}
      onClick={handleToggle}
    >
      {/* Switch ON */}
      <div
        className={classNames('w-3 h-3 rounded-full shadow-md transition-all transform', {
          'transform translate-x-7': toggle,
          'bg-white': toggle,
          'bg-neutral-7': !toggle,
        })}
      ></div>
    </div>
  );
}

export default Switch;
