// app/components/ui/Button.js
'use client';
import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}, ref) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#37DD00] hover:bg-[#37EE00] text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;