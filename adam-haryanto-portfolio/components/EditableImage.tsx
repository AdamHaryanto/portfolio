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

  // Compress image using canvas
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
            alert("GIF is too large to save locally. Try using a smaller GIF (under 2MB recommended) or use a URL instead.");
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // For non-GIF images, compress as usual
      try {
        const compressedImage = await compressImage(file, 1200, 0.7);
        setCurrentSrc(compressedImage);

        try {
          localStorage.setItem(`img_${storageKey}`, compressedImage);
        } catch (storageError) {
          // If still too large, try with lower quality
          console.warn("First compression attempt failed, trying with lower quality...");
          try {
            const moreCompressed = await compressImage(file, 800, 0.5);
            setCurrentSrc(moreCompressed);
            localStorage.setItem(`img_${storageKey}`, moreCompressed);
          } catch (e) {
            console.error("Failed to save to localStorage even after compression", e);
            alert("Image is too large to save locally. Try using a smaller image (under 1MB recommended).");
          }
        }
      } catch (error) {
        console.error("Failed to compress image", error);
        // Fallback to original method
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setCurrentSrc(result);
          try {
            localStorage.setItem(`img_${storageKey}`, result);
          } catch (e) {
            console.error("Failed to save to localStorage (likely quota exceeded)", e);
            alert("Image is too large to save locally, but it will show for this session.");
          }
        };
        reader.readAsDataURL(file);
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