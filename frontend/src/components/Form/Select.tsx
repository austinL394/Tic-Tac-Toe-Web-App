import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import ArrowDownIcon from '@components/Icons/ArrowDownIcon';
import classNames from 'classnames';

export interface Option {
  label: string | ReactElement;
  labelIcon?: ReactElement;
  value?: string;
}

interface SelectMenuProps {
  title: string;
  name: string;
  value?: string;
  list: Option[];
  allowEmpty?: boolean;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  gap?: number;
  error?: string;
  height?: number;
  tabIndex?: number;
  iconTestId?: string;
  onChange?: (value: string | undefined, name: string) => void;
}

const SelectMenu: React.FC<SelectMenuProps> = ({
  title,
  name,
  value,
  error,
  fontSize = 12,
  paddingX = 12,
  paddingY = 7,
  gap = 2,
  list,
  allowEmpty = false,
  height = 32,
  tabIndex,
  iconTestId,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setSelected(list.find((ob) => ob.value === value) || null);
  }, [value, list, setSelected]);

  const toggleDropdownMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen((open) => !open);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleSelect = (option: Option) => {
    if (onChange) onChange(option.value, name);
    setSelected(option);
    setTouched(true);
    setOpen(false);
  };

  const itemClasses = (option: Option) =>
    'select-option-item ' +
    `${
      selected && option.value == selected.value ? 'text-sky-600' : 'text-gray-600'
    } px-4 hover:bg-sky-50 hover:text-sky-600 text-left w-full flex items-center gap-4 text-xss`;

  const handleCloseOptions = useCallback((e: MouseEvent) => {
    if (
      typeof (e?.target as Element)?.className?.includes === 'function' &&
      !(e.target as Element).className.includes('select-option-item')
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    // Add click event listener
    document.addEventListener('mousedown', handleCloseOptions);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('mousedown', handleCloseOptions);
    };
  }, [handleCloseOptions]);

  return (
    <>
      <div className="relative inline-block w-full" ref={dropdownRef} style={{ fontSize: fontSize }}>
        <button
          onClick={toggleDropdownMenu}
          tabIndex={tabIndex}
          className={classNames(
            `flex justify-between w-full items-center gap-${gap} text-gray-500 border-[1px] active:border-sky-500 focus:border-sky-500 outline-none bg-white rounded-[10px] transition`,
            {
              'border-red-500': !!error,
            },
          )}
          style={{
            paddingTop: paddingY,
            paddingBottom: paddingY,
            paddingLeft: paddingX,
            paddingRight: paddingX,
            height,
          }}
        >
          <span className="whitespace-nowrap">
            {selected?.value || touched ? (
              <div className="flex text-xss w-full justify-between gap-2 items-center">
                {selected?.labelIcon} {selected?.label}
              </div>
            ) : (
              title
            )}
          </span>
          <ArrowDownIcon height="1.5em" fill="black" data-testid={iconTestId} />
        </button>

        <div
          className={
            'absolute z-10 min-w-full w-max max-h-[250px] overflow-auto bg-white shadow-md cursor-pointer rounded-lg transition duration-300 ' +
            (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-2')
          }
          style={{ paddingTop: paddingY, paddingBottom: paddingY }}
        >
          <ul>
            {allowEmpty && (
              <li
                className={itemClasses({ label: '', value: undefined })}
                onClick={() => handleSelect({ label: '', value: undefined })}
                style={{ paddingTop: paddingY, paddingBottom: paddingY }}
              >
                &nbsp;
              </li>
            )}
            {list.map((option, i) => (
              <li
                key={i}
                className={classNames(itemClasses(option), 'whitespace-nowrap')}
                onClick={() => handleSelect(option)}
                style={{ paddingTop: paddingY, paddingBottom: paddingY }}
              >
                {option.labelIcon}
                {option.label}
              </li>
            ))}
          </ul>
        </div>
        {error && (
          <div className="relative w-full">
            <div className="absolute text-[8px] text-black">{error}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default SelectMenu;
