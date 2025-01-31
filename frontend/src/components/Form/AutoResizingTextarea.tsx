import { useRef, useLayoutEffect } from 'react';

export const AutoResizingTextarea = ({ ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height to auto
      textarea.style.height = `${textarea.value.split('\n').length >= 2 ? textarea.scrollHeight : 15}px`; // Set height to scrollHeight
    }
  };

  useLayoutEffect(() => {
    autoResizeTextarea();
  }, []);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      style={{
        width: '100%',
        padding: 'none',
        boxSizing: 'border-box',
        resize: 'none', // Disable the resize icon
        overflow: 'hidden', // Hide scrollbars
      }}
      maxLength={160}
      onInput={autoResizeTextarea}
    />
  );
};

export default AutoResizingTextarea;
