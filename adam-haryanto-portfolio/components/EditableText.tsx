import React, { useState, useEffect } from 'react';

interface EditableTextProps {
  initialText: string;
  storageKey: string;
  isEditing: boolean;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  fullWidth?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  initialText,
  storageKey,
  isEditing,
  className = "",
  tag = 'span',
  multiline = false,
  fullWidth = true
}) => {
  const [text, setText] = useState(initialText);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`text_${storageKey}`);
    if (saved) {
      setText(saved);
    } else {
      setText(initialText);
    }
  }, [storageKey, initialText]);

  // Listen for reset (Factory Reset)
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(`text_${storageKey}`);
      setText(initialText);
    };
    window.addEventListener('reset-data', handleReset);
    return () => window.removeEventListener('reset-data', handleReset);
  }, [storageKey, initialText]);

  // Listen for revert (Cancel Session)
  useEffect(() => {
    const handleRevert = () => {
      // Upon revert, the App.tsx has already restored localStorage to the backup state.
      // We just need to re-read it.
      const saved = localStorage.getItem(`text_${storageKey}`);
      setText(saved || initialText);
    };
    window.addEventListener('revert-data', handleRevert);
    return () => window.removeEventListener('revert-data', handleRevert);
  }, [storageKey, initialText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setText(newVal);
    localStorage.setItem(`text_${storageKey}`, newVal);
  };

  if (isEditing) {
    const widthClass = fullWidth ? 'w-full' : 'w-auto min-w-[20px]';
    const inputClasses = `bg-white/50 border-2 border-brand-orange border-dashed rounded px-1 ${widthClass} focus:outline-none focus:bg-white text-inherit font-inherit ${className}`;
    
    if (multiline) {
      return (
        <textarea
          value={text}
          onChange={handleChange}
          className={inputClasses}
          rows={4}
        />
      );
    }
    return (
      <input
        type="text"
        value={text}
        onChange={handleChange}
        className={inputClasses}
      />
    );
  }

  // Render dynamic tag
  const Tag = tag as React.ElementType;
  return <Tag className={className}>{text}</Tag>;
};

export default EditableText;