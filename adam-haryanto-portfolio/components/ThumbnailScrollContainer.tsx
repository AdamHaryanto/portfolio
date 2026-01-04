import React, { useRef, useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  isEditing: boolean;
  className?: string;
}

const ThumbnailScrollContainer: React.FC<Props> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ atStart: true, atEnd: false });

  // Check if content is scrollable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScrollable = () => {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScroll(isScrollable);
      updateScrollPosition();
    };

    const updateScrollPosition = () => {
      if (!el) return;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 5;
      setScrollPosition({ atStart, atEnd });
    };

    // Check on mount and resize
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    el.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('resize', checkScrollable);
      el.removeEventListener('scroll', updateScrollPosition);
    };
  }, [children]);

  // Handle mouse wheel scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only intercept if content is scrollable horizontally
      if (el.scrollWidth > el.clientWidth) {
        // Check if primarily vertical scroll (mouse wheel)
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          e.stopPropagation();

          // Apply scroll with multiplier for better sensitivity
          const scrollAmount = e.deltaY * 1.5;
          el.scrollBy({
            left: scrollAmount,
            behavior: 'auto' // Use 'auto' for immediate response
          });
        }
      }
    };

    // Add native event listener with passive: false to allow preventDefault
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className="relative">
      {/* Left fade indicator */}
      {canScroll && !scrollPosition.atStart && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-brand-dark-bg to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className={`${className} cursor-grab active:cursor-grabbing`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
        }}
      >
        {children}
      </div>

      {/* Right fade indicator */}
      {canScroll && !scrollPosition.atEnd && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-brand-dark-bg to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
};

export default ThumbnailScrollContainer;