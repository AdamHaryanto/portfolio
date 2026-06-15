import React from 'react';
import { ChevronDown } from 'lucide-react';
import EditableText from './EditableText';

interface SectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
  storageKey?: string;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const Section: React.FC<SectionProps> = ({ 
  id, 
  title, 
  children, 
  className = '',
  isEditing = false,
  storageKey,
  isCollapsible = false,
  isExpanded = true,
  onToggle
}) => {
  return (
    <section id={id} className={`py-8 md:py-12 px-4 max-w-7xl mx-auto scroll-mt-20 transition-all duration-300 ${className}`}>
      {title && (
        <div className="mb-6 flex justify-center items-center">
          <button
            onClick={isCollapsible ? onToggle : undefined}
            disabled={!isCollapsible}
            className={`
              flex items-center gap-3 bg-white dark:bg-brand-dark-bg border-4 border-brand-dark dark:border-brand-bg rounded-full px-6 py-3 shadow-retro-sm dark:shadow-retro-sm-light 
              ${isCollapsible ? 'hover:scale-[1.03] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer' : 'pointer-events-none'}
              ${isCollapsible && !isExpanded ? 'animate-none opacity-80' : 'animate-retro-badge'}
            `}
          >
            {storageKey ? (
              <EditableText 
                initialText={title}
                storageKey={storageKey}
                isEditing={isEditing}
                tag="h2"
                className="font-black text-lg md:text-xl uppercase tracking-wider text-brand-dark dark:text-brand-bg"
              />
            ) : (
              <h2 className="font-black text-lg md:text-xl uppercase tracking-wider text-brand-dark dark:text-brand-bg">{title}</h2>
            )}
            {isCollapsible && (
              <ChevronDown 
                size={20} 
                className={`text-brand-dark dark:text-brand-bg transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
              />
            )}
          </button>
        </div>
      )}
      <div 
        className={`
          transition-all duration-300 ease-in-out origin-top
          ${isCollapsible ? (isExpanded ? 'max-h-[5000px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0 overflow-hidden pointer-events-none') : ''}
        `}
      >
        {children}
      </div>
    </section>
  );
};

export default Section;