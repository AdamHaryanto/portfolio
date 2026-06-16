import React, { useRef, useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  isEditing: boolean;
  className?: string;
}

const ThumbnailScrollContainer: React.FC<Props> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [edgeFade, setEdgeFade] = useState({ left: 0, right: 0 });

  // Check if content is scrollable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateEdgeFade = () => {
      const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      if (maxScroll <= 0) {
        setEdgeFade({ left: 0, right: 0 });
        return;
      }

      const fadeDistance = Math.min(96, Math.max(48, el.clientWidth * 0.12));
      const left = Math.min(el.scrollLeft / fadeDistance, 1);
      const right = Math.min((maxScroll - el.scrollLeft) / fadeDistance, 1);
      setEdgeFade({ left, right });
    };

    const checkScrollable = () => {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScroll(isScrollable);
      updateEdgeFade();
    };

    // Check on mount and resize
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    el.addEventListener('scroll', updateEdgeFade, { passive: true });

    return () => {
      window.removeEventListener('resize', checkScrollable);
      el.removeEventListener('scroll', updateEdgeFade);
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

  const leftEdgeOpacity = 1 - edgeFade.left;
  const rightEdgeOpacity = 1 - edgeFade.right;
  const maskImage = canScroll
    ? `linear-gradient(90deg, rgba(0,0,0,${leftEdgeOpacity}) 0%, rgba(0,0,0,${1 - edgeFade.left * 0.45}) 18px, #000 58px, #000 calc(100% - 58px), rgba(0,0,0,${1 - edgeFade.right * 0.45}) calc(100% - 18px), rgba(0,0,0,${rightEdgeOpacity}) 100%)`
    : undefined;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`${className} cursor-grab active:cursor-grabbing transition-opacity duration-500 ease-out`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ThumbnailScrollContainer;
