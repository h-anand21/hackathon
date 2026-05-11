import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`border-gray-300 border focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm rounded-md p-2 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
