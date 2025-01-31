import classNames from 'classnames';
import { useEffect, useState } from 'react';
import Datepicker from 'tailwind-datepicker-react';
import CalendarIcon from '@components/Icons/CalendarIcon';
import { formatDate } from '../../utils/datetime';

const options = {
  autoHide: true,
  todayBtn: false,
  clearBtn: false,
  minDate: new Date('1900-01-01'),
};

interface DateInputProps {
  customStyles?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (_: Date | null) => void;
  showIcon?: boolean;
  formatDateFunc?: (date: number | Date | undefined) => string;
  iconTestId?: string;
}

const DatePickerComponent = ({
  customStyles,
  placeholder,
  value,
  showIcon = true,
  onChange,
  formatDateFunc = formatDate,
  iconTestId,
}: DateInputProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(formatDateFunc(value || undefined));

  useEffect(() => {
    if (value === undefined) setInputValue('');
  }, [value]);

  const handleChange = (_selectedDate: Date) => {
    if (onChange) {
      onChange(_selectedDate);
    }
    setInputValue(formatDateFunc(_selectedDate));
  };

  const handleClose = (state: boolean) => {
    setShow(state);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    const parsedDate = new Date(newValue);
    if (!isNaN(parsedDate.getTime())) {
      if (onChange) onChange(new Date(parsedDate));
    } else {
      if (onChange) onChange(null);
    }
  };

  return (
    <div className="w-full relative">
      <input
        className={`${customStyles} relative min-w-[90px] h-[33px] items-center pt-2 text-left pl-2 bg-gray-50 text-gray-900 rounded-[10px] focus:ring-blue-500 focus:border-blue-500 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
        onClick={() => setShow(true)}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      {showIcon && (
        <div className="absolute inset-y-0 end-[9px] flex items-center ps-3.5 pointer-events-none">
          <CalendarIcon height="1.5em" data-testid={iconTestId} />
        </div>
      )}
      <Datepicker
        classNames={classNames('w-0 h-0 overflow-hidden', { hidden: !show })}
        options={options}
        value={value ? new Date(value) : undefined}
        onChange={handleChange}
        show={show}
        setShow={handleClose}
      />
    </div>
  );
};

export default DatePickerComponent;
