import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link, Film, Image as ImageIcon } from 'lucide-react';
import { CUSTOM_IMAGES } from '../constants';

interface EditableMediaProps {
  src: string;
  alt?: string;
  className?: string;
  storageKey: string;
  isEditing: boolean;
  wrapperClassName?: string;
  onUpdate?: (newSrc: string) => void; // Optional callback if parent manages state
}

const EditableMedia: React.FC<EditableMediaProps> = ({
  src,
  alt = "Media",
  className,
  storageKey,
  isEditing,
  wrapperClassName = "w-full h-full",
  onUpdate
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved media with priority: localStorage > CUSTOM_IMAGES > src prop
  useEffect(() => {
    try {
      // Priority 1: Check localStorage (for current editing session)
      const saved = localStorage.getItem(`media_${storageKey}`);
      if (saved) {
        setCurrentSrc(saved);
        if (onUpdate) onUpdate(saved);
        return;
      }

      // Priority 2: Check CUSTOM_IMAGES from constants.ts (for deployed custom media)
      if (CUSTOM_IMAGES && CUSTOM_IMAGES[storageKey]) {
        setCurrentSrc(CUSTOM_IMAGES[storageKey]);
        if (onUpdate) onUpdate(CUSTOM_IMAGES[storageKey]);
        return;
      }

      // Priority 3: Use src from props
      setCurrentSrc(src);
    } catch (e) {
      console.error("Failed to access localStorage", e);
    }
  }, [storageKey, src]);

  // Listen for global reset event
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(`media_${storageKey}`);
      setCurrentSrc(src);
      if (onUpdate) onUpdate(src);
    };
    window.addEventListener('reset-images', handleReset);
    return () => window.removeEventListener('reset-images', handleReset);
  }, [storageKey, src]);

  // Listen for revert (Cancel Session)
  useEffect(() => {
    const handleRevert = () => {
      const saved = localStorage.getItem(`media_${storageKey}`);
      if (saved) {
        setCurrentSrc(saved);
        if (onUpdate) onUpdate(saved);
      } else if (CUSTOM_IMAGES && CUSTOM_IMAGES[storageKey]) {
        setCurrentSrc(CUSTOM_IMAGES[storageKey]);
        if (onUpdate) onUpdate(CUSTOM_IMAGES[storageKey]);
      } else {
        setCurrentSrc(src);
        if (onUpdate) onUpdate(src);
      }
    };
    window.addEventListener('revert-data', handleRevert);
    return () => window.removeEventListener('revert-data', handleRevert);
  }, [storageKey, src]);

  const saveMedia = (newSrc: string) => {
    setCurrentSrc(newSrc);
    if (onUpdate) onUpdate(newSrc);
    try {
      localStorage.setItem(`media_${storageKey}`, newSrc);
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      alert("Media is too large to save locally.");
    }
  };

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
          localStorage.setItem(`media_${storageKey}`, compressedImage);
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
          if (onUpdate) onUpdate(result);
          try {
            localStorage.setItem(`media_${storageKey}`, result);
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
      if (onUpdate) onUpdate(result.dataUrl);

      if (!result.success) {
        alert("Image was compressed to display, but it's still too large to save permanently. The image will show during this session. For permanent storage, try a smaller image or use a URL.");
      }
    }
  };

  const handleUrlInput = () => {
    const url = prompt("Enter Image or Video URL (YouTube, Instagram, Google Drive, MP4, etc):", currentSrc);
    if (url !== null && url.trim() !== "") {
      saveMedia(url);
    }
  };

  // Helper to detect media type
  const isYoutube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const isVideoFile = (url: string) => url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith('data:video');

  // Google Drive helpers
  const isGoogleDrive = (url: string) => url.includes('drive.google.com');

  const getGoogleDriveFileId = (url: string): string | null => {
    // Match patterns like:
    // https://drive.google.com/file/d/FILE_ID/view
    // https://drive.google.com/open?id=FILE_ID
    // https://drive.google.com/uc?id=FILE_ID
    // https://drive.google.com/uc?export=view&id=FILE_ID

    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,           // /file/d/FILE_ID/...
      /[?&]id=([a-zA-Z0-9_-]+)/,               // ?id=FILE_ID or &id=FILE_ID
      /\/d\/([a-zA-Z0-9_-]+)/,                  // /d/FILE_ID (short form)
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getGoogleDriveImageUrl = (url: string): string => {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      // Direct image URL format
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
  };

  const getGoogleDriveVideoEmbed = (url: string): string => {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      // Embed preview format for videos
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  // Check if the Google Drive file is likely a video based on URL or context
  const isGoogleDriveVideo = (url: string): boolean => {
    // If URL contains video hints or the user explicitly says it's a video
    const videoHints = ['video', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
    return videoHints.some(hint => url.toLowerCase().includes(hint));
  };

  // Instagram helpers
  const isInstagram = (url: string) => url.includes('instagram.com');

  const getInstagramPostId = (url: string): string | null => {
    // Match patterns like:
    // https://www.instagram.com/p/POST_ID/
    // https://www.instagram.com/reel/REEL_ID/
    // https://www.instagram.com/tv/TV_ID/

    const patterns = [
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,      // /p/POST_ID
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,   // /reel/REEL_ID
      /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,     // /tv/TV_ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getInstagramEmbed = (url: string): string => {
    // Extract the path type (p, reel, or tv) and post ID
    const pMatch = url.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    if (pMatch) {
      const [, type, postId] = pMatch;
      return `https://www.instagram.com/${type}/${postId}/embed/`;
    }
    return url;
  };

  const getYoutubeEmbed = (url: string) => {
    let videoId = "";

    // Handle youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    }
    // Handle youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Handle youtube.com/shorts/VIDEO_ID (YouTube Shorts)
    else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0];
    }
    // Handle youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  // Check if URL is a YouTube Shorts (for proper aspect ratio)
  const isYoutubeShorts = (url: string) => url.includes('youtube.com/shorts/');

  // Determine how to render the media
  const renderMedia = () => {
    if (isYoutube(currentSrc)) {
      // Use 9:16 aspect ratio for YouTube Shorts, 16:9 for regular videos
      const isShorts = isYoutubeShorts(currentSrc);
      const aspectRatio = isShorts ? '177.78%' : '56.25%'; // 9:16 vs 16:9

      return (
        <div
          className={`relative ${isShorts ? 'max-w-[350px] mx-auto' : 'w-full'}`}
          style={{ paddingBottom: aspectRatio }}
        >
          <iframe
            src={getYoutubeEmbed(currentSrc)}
            className="absolute inset-0 w-full h-full rounded-lg"
            title={alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (isGoogleDrive(currentSrc)) {
      // Always use iframe preview for Google Drive
      // This works for both videos and images since we can't reliably detect file type from URL
      const fileId = getGoogleDriveFileId(currentSrc);
      if (fileId) {
        return (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            <iframe
              src={`https://drive.google.com/file/d/${fileId}/preview`}
              className="absolute inset-0 w-full h-full"
              title={alt}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
        );
      }
    }

    if (isInstagram(currentSrc)) {
      // Embed Instagram post/reel/tv
      return (
        <div className="relative w-full" style={{ paddingBottom: '125%' }}> {/* 4:5 aspect ratio for Instagram */}
          <iframe
            src={getInstagramEmbed(currentSrc)}
            className="absolute inset-0 w-full h-full"
            title={alt}
            allowFullScreen
            scrolling="no"
            style={{ border: 'none', overflow: 'hidden' }}
          />
        </div>
      );
    }

    if (isVideoFile(currentSrc)) {
      return (
        <video
          src={currentSrc}
          className={className}
          controls
          playsInline
        />
      );
    }

    // Default: treat as image
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={className}
      />
    );
  };

  return (
    <div className={`relative group ${wrapperClassName} bg-black/5`}>
      {/* Renderer */}
      {renderMedia()}

      {/* Edit Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-brand-green text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform w-40 justify-center"
          >
            <Upload size={16} /> Upload Img
          </button>
          <button
            onClick={handleUrlInput}
            className="bg-brand-orange text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform w-40 justify-center"
          >
            <Link size={16} /> Set URL
          </button>
          <span className="text-white text-[10px] opacity-70 mt-1 px-4 text-center">
            GIF • Instagram • Google Drive • YouTube/Shorts
          </span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*" // Restrict upload to images to save localstorage space, suggest URL for video
        onChange={handleFileChange}
      />
    </div>
  );
};

export default EditableMedia;