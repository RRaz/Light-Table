import React, { useRef, useEffect, useState } from 'react';
import { Photo } from '../types';

interface ThumbnailStripProps {
  photos: Photo[];
  selectedIds: Set<string>;
  activeIndex: number;
  onSelectPhoto: (index: number) => void;
  onToggleSelection: (id: string, e: React.MouseEvent) => void;
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({ 
  photos, 
  selectedIds, 
  activeIndex, 
  onSelectPhoto,
  onToggleSelection 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBar, setShowLeftBar] = useState(false);
  const [showRightBar, setShowRightBar] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Using a threshold of 20px for better stability on various screen densities
    setShowLeftBar(el.scrollLeft > 20);
    setShowRightBar(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    // Convert vertical wheel to horizontal scroll for mouse users
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.children[activeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    // Update indicators after the smooth scroll finishes
    const timer = setTimeout(checkScroll, 400);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <div className="flex-none w-full py-2 bg-background-dark z-10 relative">
      {/* 
          Scroll Indicators: Shifted 6px (1.5rem) inward to avoid bezel conflict.
          Color changed to light grey (neutral-400) as requested.
          Added pointer-events-none to ensure they don't block interaction.
      */}
      <div 
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-12 bg-neutral-400/60 rounded-full z-30 pointer-events-none transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.1)] ${
          showLeftBar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      />
      <div 
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-12 bg-neutral-400/60 rounded-full z-30 pointer-events-none transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.1)] ${
          showRightBar ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      />

      {/* Edge fades for smoother visual transition */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background-dark to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background-dark to-transparent z-20 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="px-8 flex gap-4 overflow-x-auto no-scrollbar snap-x pb-3 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {photos.map((photo, index) => {
          const isSelected = selectedIds.has(photo.id);
          const isActive = index === activeIndex;

          return (
            <div 
              key={photo.id}
              onClick={() => onSelectPhoto(index)}
              className={`snap-center shrink-0 relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border shadow-md ${
                isActive 
                  ? 'border-white/20 shadow-white/5 scale-105 z-10 opacity-100' 
                  : isSelected 
                    ? 'border-white/10 opacity-100' 
                    : 'border-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{ backgroundImage: `url("${photo.url}")` }}
              ></div>
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
              
              {/* Checkbox: Kept at 50% size as requested (h-4 w-4) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelection(photo.id, e);
                }}
                className={`absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full shadow-lg z-30 transition-all active:scale-75 ${
                  isSelected 
                    ? 'bg-primary text-white scale-110' 
                    : 'bg-black/60 border border-white/20 text-white/30 hover:text-white'
                }`}
                aria-label={isSelected ? "Deselect photo" : "Select photo"}
              >
                <span className="material-symbols-outlined text-[10px] font-black">
                  {isSelected ? 'check' : 'add'}
                </span>
              </button>

              {/* Active Indicator: Bottom bar updated to light grey */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-300 z-20 shadow-[0_-1px_4px_rgba(255,255,255,0.1)]" />
              )}
            </div>
          );
        })}
        {/* End spacer for centering the last element */}
        <div className="w-12 shrink-0"></div>
      </div>
    </div>
  );
};