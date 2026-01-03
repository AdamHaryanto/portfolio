import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'orange' | 'blue' | 'yellow' | 'green' | 'white' | 'red';
  noShadow?: boolean;
  disableHover?: boolean; // New prop to disable hover movement
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
      default: return 'bg-white';
    }
  };

  // Logic: 
  // If noShadow is true -> No shadow, no movement.
  // If noShadow is false:
  //    - Always show shadow-retro.
  //    - If disableHover is true -> No hover effects.
  //    - If disableHover is false -> Add hover effects (remove shadow, translate).

  return (
    <div className={`
      relative border-4 border-brand-dark rounded-xl
      ${getBgColor()}
      ${noShadow ? '' : `shadow-retro ${disableHover ? '' : 'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'}`}
      transition-all duration-200 ease-in-out
      overflow-hidden
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;