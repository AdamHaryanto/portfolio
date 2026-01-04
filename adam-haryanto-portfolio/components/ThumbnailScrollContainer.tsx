import React, { useRef, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  isEditing: boolean; // Kept for prop compatibility
  className?: string;
}

const ThumbnailScrollContainer: React.FC<Props> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If content is larger than container (scrollable)
      if (el.scrollWidth > el.clientWidth) {
         // Prevent default page scroll
         e.preventDefault();
         
         // Scroll horizontally using vertical delta (standard mouse wheel)
         // or horizontal delta (trackpad)
         el.scrollLeft += e.deltaY + e.deltaX;
      }
    };

    // Add native event listener with passive: false to allow preventDefault
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={className}
      // Ensure smooth scrolling on iOS/Mobile
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
};

export default ThumbnailScrollContainer;