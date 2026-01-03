import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link, Film, Image as ImageIcon } from 'lucide-react';

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

  // Load saved media from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`media_${storageKey}`);
      if (saved) {
        setCurrentSrc(saved);
        if(onUpdate) onUpdate(saved);
      } else {
        setCurrentSrc(src);
      }
    } catch (e) {
      console.error("Failed to access localStorage", e);
    }
  }, [storageKey, src]);

  // Listen for global reset event
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(`media_${storageKey}`);
      setCurrentSrc(src);
      if(onUpdate) onUpdate(src);
    };
    window.addEventListener('reset-images', handleReset);
    return () => window.removeEventListener('reset-images', handleReset);
  }, [storageKey, src]);

  // Listen for revert (Cancel Session)
  useEffect(() => {
    const handleRevert = () => {
      const saved = localStorage.getItem(`media_${storageKey}`);
      setCurrentSrc(saved || src);
      if(onUpdate) onUpdate(saved || src);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        saveMedia(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = () => {
    const url = prompt("Enter Image or Video URL (YouTube, Vimeo, MP4, etc):", currentSrc);
    if (url !== null && url.trim() !== "") {
      saveMedia(url);
    }
  };

  // Helper to detect media type
  const isYoutube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const isVideoFile = (url: string) => url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith('data:video');
  
  const getYoutubeEmbed = (url: string) => {
    let videoId = "";
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  return (
    <div className={`relative group ${wrapperClassName} bg-black/5`}>
      {/* Renderer */}
      {isYoutube(currentSrc) ? (
        <iframe 
          src={getYoutubeEmbed(currentSrc)} 
          className={className} 
          title={alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : isVideoFile(currentSrc) ? (
        <video 
          src={currentSrc} 
          className={className} 
          controls 
          playsInline
        />
      ) : (
        <img 
          src={currentSrc} 
          alt={alt} 
          className={className} 
        />
      )}
      
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
              Use URL for Videos (YouTube/MP4)
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