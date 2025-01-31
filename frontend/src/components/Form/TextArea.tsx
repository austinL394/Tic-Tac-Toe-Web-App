import classNames from 'classnames';

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  className?: string;
  error?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({ className, placeholder, value, onChange, error }: TextAreaProps) => {
  return (
    <div className="w-full">
      <textarea
        className={classNames(
          `group flex h-9 font-light items-center justify-between gap-2.5 rounded-[10px] border border-solid bg-white transition-all px-3 py-2 p-0  focus:outline-none focus:ring-0 focus:shadow-none bg-transparent text-sm  outline-none placeholder:text-gray-400 group-hover:block sm:block active:outline-none ${className} `,
          {
            'border-red-500': error,
            'border-white': !error,
          },
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && (
        <div className="relative">
          <div className="absolute text-left text-[8px]">{error}</div>
        </div>
      )}
    </div>
  );
};

export default TextArea;
