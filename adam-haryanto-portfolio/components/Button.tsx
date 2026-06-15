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
  const baseStyles = "min-h-11 px-5 py-2.5 inline-flex items-center justify-center font-bold border-[3px] border-brand-dark rounded-xl transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-retro-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50 disabled:translate-x-0 disabled:translate-y-0";
  
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
