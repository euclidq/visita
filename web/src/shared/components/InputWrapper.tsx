
import type { InputProps } from 'antd';
import type { ReactNode } from 'react';

interface InputWrapperProps extends InputProps {
  label: ReactNode;
  children: ReactNode;
  error?: string;
}

const InputWrapper = ({ label, id, children, error }: InputWrapperProps) => {

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputWrapper;
