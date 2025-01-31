import classNames from 'classnames';
import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ className, placeholder, value, onChange, error, disabled }: InputProps) => {
  return (
    <div className={`relative  rounded-[10px]`}>
      <input
        type="text"
        className={classNames(
          `${className} group flex h-9 w-full font-light items-center bg-white justify-between gap-2.5 rounded-[10px] border border-solid  transition-all px-3 py-2 p-0 focus:outline-none focus:ring-0 focus:shadow-none bg-transparent text-sm outline-none placeholder:text-gray-400 group-hover:block sm:block active:outline-none ${className}`,
          {
            'border-red-500': error,
            'border-white': !error,
          },
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && (
        <div className="relative w-full">
          <div className="absolute text-[8px] text-black">{error}</div>
        </div>
      )}
    </div>
  );
};

export default Input;
