import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 font-bold border-4 border-brand-dark rounded-xl transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-retro";
  
  const variants = {
    primary: "bg-brand-green text-brand-dark hover:bg-[#4AA886]",
    secondary: "bg-brand-orange text-brand-dark hover:bg-[#E36C2E]",
    outline: "bg-transparent text-brand-dark hover:bg-brand-dark/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;