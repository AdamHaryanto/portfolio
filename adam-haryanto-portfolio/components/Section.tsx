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
    <section id={id} className={`py-16 md:py-24 px-4 max-w-7xl mx-auto scroll-mt-20 ${className}`}>
      {title && (
        <div className="mb-10 flex justify-center items-center">
          <div className="bg-white dark:bg-brand-dark-bg border-4 border-brand-dark dark:border-brand-bg rounded-full px-6 py-3 shadow-retro-sm dark:shadow-retro-sm-light animate-retro-badge">
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