import React, { useState, useEffect } from 'react';
import { CUSTOM_TEXTS } from '../constants';

interface EditableTextProps {
  initialText: string;
  storageKey: string;
  isEditing: boolean;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  fullWidth?: boolean;
  onUpdate?: (newText: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({
  initialText,
  storageKey,
  isEditing,
  className = "",
  tag = 'span',
  multiline = false,
  fullWidth = true,
  onUpdate
}) => {
  const [text, setText] = useState(initialText);

  // Load text with priority: localStorage > CUSTOM_TEXTS > initialText
  useEffect(() => {
    // Priority 1: Check localStorage (for current editing session)
    const localSaved = localStorage.getItem(`text_${storageKey}`);
    if (localSaved) {
      setText(localSaved);
      return;
    }

    // Priority 2: Check CUSTOM_TEXTS from constants.ts (for deployed custom text)
    if (CUSTOM_TEXTS && CUSTOM_TEXTS[storageKey]) {
      setText(CUSTOM_TEXTS[storageKey]);
      return;
    }

    // Priority 3: Use initial text from props
    setText(initialText);
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
      if (saved) {
        setText(saved);
      } else if (CUSTOM_TEXTS && CUSTOM_TEXTS[storageKey]) {
        setText(CUSTOM_TEXTS[storageKey]);
      } else {
        setText(initialText);
      }
    };
    window.addEventListener('revert-data', handleRevert);
    return () => window.removeEventListener('revert-data', handleRevert);
  }, [storageKey, initialText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setText(newVal);
    localStorage.setItem(`text_${storageKey}`, newVal);
    if (onUpdate) onUpdate(newVal);
  };

  if (isEditing) {
    const widthClass = fullWidth ? 'w-full' : 'w-auto min-w-[20px]';
    const inputClasses = `bg-white/50 dark:bg-gray-800 border-2 border-brand-orange border-dashed rounded px-1 ${widthClass} focus:outline-none focus:bg-white dark:focus:bg-gray-900 text-inherit font-inherit dark:text-white ${className}`;

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