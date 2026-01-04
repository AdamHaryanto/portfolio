import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storageKey: string;
  isEditing: boolean;
  wrapperClassName?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  className,
  storageKey,
  isEditing,
  wrapperClassName = "w-full h-full",
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src as string | undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved image from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`img_${storageKey}`);
      if (saved) {
        setCurrentSrc(saved);
      } else {
        setCurrentSrc(src as string | undefined);
      }
    } catch (e) {
      console.error("Failed to access localStorage", e);
    }
  }, [storageKey, src]);

  // Listen for global reset event
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(`img_${storageKey}`);
      setCurrentSrc(src as string | undefined);
    };
    window.addEventListener('reset-images', handleReset);
    return () => window.removeEventListener('reset-images', handleReset);
  }, [storageKey, src]);

  // Listen for revert (Cancel Session)
  useEffect(() => {
    const handleRevert = () => {
      const saved = localStorage.getItem(`img_${storageKey}`);
      setCurrentSrc(saved || src as string | undefined);
    };
    window.addEventListener('revert-data', handleRevert);
    return () => window.removeEventListener('revert-data', handleRevert);
  }, [storageKey, src]);

  // Compress image using canvas with configurable settings
  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Try to save with multiple compression attempts
  const trySaveWithCompression = async (file: File): Promise<{ success: boolean; dataUrl: string }> => {
    // Compression levels to try (from high quality to low)
    const compressionLevels = [
      { maxWidth: 1600, quality: 0.8 },  // High quality
      { maxWidth: 1200, quality: 0.7 },  // Medium-high
      { maxWidth: 1000, quality: 0.6 },  // Medium
      { maxWidth: 800, quality: 0.5 },   // Medium-low
      { maxWidth: 600, quality: 0.4 },   // Low
      { maxWidth: 500, quality: 0.3 },   // Very low
      { maxWidth: 400, quality: 0.25 },  // Minimal
    ];

    let lastDataUrl = '';

    for (const level of compressionLevels) {
      try {
        const compressedImage = await compressImage(file, level.maxWidth, level.quality);
        lastDataUrl = compressedImage;

        // Try to save to localStorage
        try {
          localStorage.setItem(`img_${storageKey}`, compressedImage);
          console.log(`Saved with compression: ${level.maxWidth}px, ${level.quality * 100}% quality`);
          return { success: true, dataUrl: compressedImage };
        } catch (storageError) {
          console.log(`Compression ${level.maxWidth}px failed, trying next level...`);
          continue; // Try next compression level
        }
      } catch (compressError) {
        console.error('Compression error:', compressError);
        continue;
      }
    }

    // All compression attempts failed, return last attempt anyway (for display only)
    return { success: false, dataUrl: lastDataUrl };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`Uploading file: ${file.name}, Size: ${fileSizeMB.toFixed(2)}MB`);

      // Check if the file is a GIF - don't compress GIFs to preserve animation
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

      if (isGif) {
        // For GIF files, read directly without compression to preserve animation
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setCurrentSrc(result);
          try {
            localStorage.setItem(`img_${storageKey}`, result);
          } catch (e) {
            console.error("Failed to save GIF to localStorage (likely too large)", e);
            alert("GIF is too large to save locally. The image will display during this session but won't persist after reload. Try using a smaller GIF or a URL instead.");
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // For non-GIF images, use progressive compression
      const result = await trySaveWithCompression(file);
      setCurrentSrc(result.dataUrl);

      if (!result.success) {
        alert("Image was compressed to display, but it's still too large to save permanently. The image will show during this session. For permanent storage, try a smaller image or use a URL.");
      }
    }
  };

  return (
    <div className={`relative group ${wrapperClassName}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        {...props}
      />

      {isEditing && (
        <div
          className="absolute inset-0 bg-brand-dark/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <div className="bg-white text-brand-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 transform hover:scale-105 transition-transform shadow-xl border-2 border-brand-dark">
            <Upload size={16} />
            <span className="text-sm">Change Image</span>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default EditableImage;