import React from 'react';
import EditableText from './EditableText';

interface SectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
  storageKey?: string;
}

const Section: React.FC<SectionProps> = ({ 
  id, 
  title, 
  children, 
  className = '',
  isEditing = false,
  storageKey
}) => {
  return (
    <section id={id} className={`reveal-section py-7 sm:py-12 lg:py-16 px-3 sm:px-6 max-w-6xl mx-auto scroll-mt-20 ${className}`}>
      {title && (
        <div className="mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <div className="h-0.5 sm:h-[3px] flex-1 bg-brand-dark/15 dark:bg-brand-bg/20 rounded-full" />
          <div className="bg-white dark:bg-brand-dark-bg border-2 sm:border-[3px] border-brand-dark dark:border-brand-bg rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 shadow-retro-sm dark:shadow-retro-sm-light">
            {storageKey ? (
              <EditableText 
                initialText={title}
                storageKey={storageKey}
                isEditing={isEditing}
                tag="h2"
                className="font-black text-sm sm:text-xl uppercase tracking-[0.12em] text-brand-dark dark:text-brand-bg"
              />
            ) : (
              <h2 className="font-black text-sm sm:text-xl uppercase tracking-[0.12em] text-brand-dark dark:text-brand-bg">{title}</h2>
            )}
          </div>
          <div className="h-0.5 sm:h-[3px] flex-1 bg-brand-dark/15 dark:bg-brand-bg/20 rounded-full" />
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;
