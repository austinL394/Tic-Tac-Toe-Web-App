import { debounce } from 'lodash';
import { ChangeEvent, useCallback, useMemo } from 'react';
import SearchIcon from '../Icons/SearchIcon';

// Default debounce time in milliseconds
const DEFAULT_DEBOUNCE_TIME = 50;

interface SearchInputProps {
  placeholder?: string; // Placeholder text for the input field
  debounceTime?: number; // Time to wait before calling the handleChange function after the user stops typing
  value?: string;
  className?: string;
  onChange: (value: string) => void; // Function to call when the input value changes
}

const SearchInput: React.FC<SearchInputProps> = ({
  className = 'text-sm text-black',
  placeholder,
  value,
  debounceTime = DEFAULT_DEBOUNCE_TIME,
  onChange,
}) => {
  // Debounced version of the handleChange function
  const debouncedHandleChange = useMemo(
    () =>
      debounce((value: string) => {
        // Call the handleChange function if it is provided
        if (onChange) {
          onChange(value);
        }
      }, debounceTime),
    [debounceTime, onChange],
  );

  // Function to call when the input value changes
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Update the input field value
      onChange(event.target.value);
      // Call the debounced handleChange function
      debouncedHandleChange(event.target.value);
    },
    [onChange, debouncedHandleChange],
  );

  return (
    <div className="relative flex w-full items-center gap-2.5">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className={`group flex h-9 w-full items-center justify-between gap-2.5 rounded-[10px] border border-solid bg-white transition-all px-3 py-2 p-0 border-white focus:outline-none focus:ring-0 focus:shadow-none bg-transparent outline-none placeholder:text-gray-400 group-hover:block sm:block active:outline-none ${className}`}
      />
      <SearchIcon height="1.5em" className="absolute right-2" />
    </div>
  );
};

export default SearchInput;
