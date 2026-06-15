import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'orange' | 'blue' | 'yellow' | 'green' | 'white' | 'red';
  noShadow?: boolean;
  disableHover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'white', 
  noShadow = false,
  disableHover = false 
}) => {
  const getBgColor = () => {
    switch (variant) {
      case 'orange': return 'bg-brand-orange';
      case 'blue': return 'bg-brand-blue';
      case 'yellow': return 'bg-brand-yellow';
      case 'green': return 'bg-brand-green';
      case 'red': return 'bg-brand-red';
      default: return 'bg-white dark:bg-brand-dark-bg';
    }
  };

  const getTextColor = () => {
      if (variant === 'white') return 'text-brand-dark dark:text-brand-bg';
      return 'text-brand-dark';
  };

  return (
    <div className={`
      relative min-w-0 max-w-full border-[3px] border-brand-dark dark:border-brand-bg rounded-2xl
      ${getBgColor()} ${getTextColor()}
      ${noShadow ? '' : `shadow-retro dark:shadow-retro-light ${disableHover ? '' : 'hover:-translate-y-0.5 hover:shadow-retro-lg'}`}
      transition-all duration-200 ease-in-out
      overflow-hidden
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
