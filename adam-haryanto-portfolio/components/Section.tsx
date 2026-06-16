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
    <section id={id} className={`py-10 md:py-14 lg:py-16 px-3 sm:px-4 lg:px-6 max-w-screen-2xl mx-auto scroll-mt-20 ${className}`}>
      {title && (
        <div className="mb-6 md:mb-8 flex justify-center items-center">
          <div className="bg-white dark:bg-brand-dark-bg border-4 border-brand-dark dark:border-brand-bg rounded-full px-5 md:px-6 py-2.5 md:py-3 shadow-retro-sm dark:shadow-retro-sm-light animate-retro-badge">
            {storageKey ? (
              <EditableText 
                initialText={title}
                storageKey={storageKey}
                isEditing={isEditing}
                tag="h2"
                className="font-black text-xl md:text-2xl uppercase tracking-wider text-brand-dark dark:text-brand-bg"
              />
            ) : (
              <h2 className="font-black text-xl md:text-2xl uppercase tracking-wider text-brand-dark dark:text-brand-bg">{title}</h2>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;
