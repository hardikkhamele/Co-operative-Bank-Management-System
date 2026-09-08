import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

/**
 * TableWrapper
 * Standard container for all tables across the application:
 * 1. Enforces consistent table card border, rounded corners, and shadow.
 * 2. Implements horizontal drag-to-scroll for desktop mouse users.
 * 3. Hides native browser scrollbar (.no-scrollbar) across Chrome, Safari, Edge, Firefox.
 * 4. Displays subtle dynamic gradient fade indicators on left/right edges when overflow exists.
 * 5. Smart click guard: distinguishes mouse dragging from clicking buttons/links.
 */
const TableWrapper = forwardRef(({
  children,
  className = '',
  containerClassName = '',
  showShadowIndicators = true,
  minHeight = '320px',
  ...props
}, ref) => {
  const scrollRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);

  const [isGrabbing, setIsGrabbing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Expose the scroll viewport element to parent ref if passed
  useImperativeHandle(ref, () => scrollRef.current);

  // Check scroll position to display left/right shadow indicators
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    
    // Observer for table content changes (e.g. data load)
    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e) => {
    // Do not initiate drag if clicking on interactive elements
    const interactive = e.target.closest('button, a, input, select, textarea, [role="button"], label');
    if (interactive) return;

    const el = scrollRef.current;
    if (!el) return;

    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current) return;
    const el = scrollRef.current;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;

    // Start drag mode if moved more than 4px
    if (Math.abs(walk) > 4) {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsGrabbing(true);
      }
      el.scrollLeft = scrollLeftRef.current - walk;
      checkScroll();
    }
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
    setIsGrabbing(false);
    // Slight timeout so click events from drag are prevented
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isDownRef.current) {
      isDownRef.current = false;
      setIsGrabbing(false);
      isDraggingRef.current = false;
    }
  };

  // Prevent accidental clicks on row/elements after dragging
  const handleClickCapture = (e) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden ${containerClassName}`}>
      {/* Dynamic Left Gradient Indicator */}
      {showShadowIndicators && canScrollLeft && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 via-black/5 to-transparent pointer-events-none z-10 transition-opacity duration-200" 
          aria-hidden="true"
        />
      )}

      {/* Dynamic Right Gradient Indicator */}
      {showShadowIndicators && canScrollRight && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 via-black/5 to-transparent pointer-events-none z-10 transition-opacity duration-200" 
          aria-hidden="true"
        />
      )}

      {/* Scrollable Viewport */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClickCapture={handleClickCapture}
        style={{ minHeight }}
        className={`overflow-x-auto no-scrollbar scroll-smooth relative ${
          isGrabbing ? 'cursor-grabbing select-none' : 'cursor-default'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

TableWrapper.displayName = 'TableWrapper';

export default TableWrapper;
