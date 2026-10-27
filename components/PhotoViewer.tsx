
import React, { useState, useRef, MouseEvent, TouchEvent, useEffect, useMemo } from 'react';
import { Photo } from '../types';

interface PhotoViewerProps {
  photo: Photo;
  currentIndex: number;
  totalCount: number;
  isSelected: boolean;
  isMagnifierActive: boolean;
  setIsMagnifierActive: (active: boolean) => void;
  magnification: number;
  setMagnification: (level: number) => void;
  isSlideshowActive?: boolean;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({ 
  photo, 
  currentIndex, 
  totalCount, 
  isSelected,
  isMagnifierActive,
  setIsMagnifierActive,
  magnification,
  setMagnification,
  isSlideshowActive = false,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, opacity: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = photo.url;
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, [photo.url]);

  const imageMetrics = useMemo(() => {
    if (!containerRef.current || naturalSize.w === 0) return null;
    const cw = containerRef.current.offsetWidth;
    const ch = containerRef.current.offsetHeight;
    const scale = Math.min(cw / naturalSize.w, ch / naturalSize.h);
    const displayW = naturalSize.w * scale;
    const displayH = naturalSize.h * scale;
    return { 
      displayW, 
      displayH, 
      offsetX: (cw - displayW) / 2, 
      offsetY: (ch - displayH) / 2, 
      scale 
    };
  }, [naturalSize, containerRef.current?.offsetWidth, containerRef.current?.offsetHeight]);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current || !isMagnifierActive || !imageMetrics) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const isInside = (
      x >= imageMetrics.offsetX && 
      x <= imageMetrics.offsetX + imageMetrics.displayW &&
      y >= imageMetrics.offsetY && 
      y <= imageMetrics.offsetY + imageMetrics.displayH
    );
    setMousePos({ x, y, opacity: isInside ? 1 : 0 });
  };

  const loupeSize = 160;
  const isLoupeVisible = isMagnifierActive && mousePos.opacity > 0;

  return (
    <div className="flex-1 w-full relative p-4 pb-2 min-h-0 flex flex-col overflow-hidden">
      <div 
        ref={containerRef}
        onMouseMove={(e) => handleInteraction(e.clientX, e.clientY)}
        onMouseLeave={() => setMousePos(p => ({ ...p, opacity: 0 }))}
        onTouchMove={(e) => handleInteraction(e.touches[0].clientX, e.touches[0].clientY)}
        className={`relative flex-1 w-full rounded-3xl overflow-hidden bg-[#020205] shadow-[0_40px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition-all duration-700 ${
          isLoupeVisible ? 'cursor-none' : 'cursor-auto'
        }`}
      >
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none transition-all duration-500 z-0"
          style={{ 
            backgroundImage: `url("${photo.url}")`,
            imageRendering: 'high-quality' as any 
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 pointer-events-none z-20" />
        
        {isLoupeVisible && (
          <div 
            className="pointer-events-none absolute z-50 rounded-full border-2 border-white/40 shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden transition-opacity duration-150"
            style={{
              width: loupeSize,
              height: loupeSize,
              left: mousePos.x - loupeSize / 2,
              top: mousePos.y - loupeSize / 2,
              opacity: mousePos.opacity,
            }}
          >
            <div 
              className="absolute bg-no-repeat transition-[background-size] duration-300"
              style={{
                backgroundImage: `url("${photo.url}")`,
                backgroundSize: `${imageMetrics!.displayW * magnification}px ${imageMetrics!.displayH * magnification}px`,
                backgroundPosition: `-${(mousePos.x - imageMetrics!.offsetX) * magnification - loupeSize / 2}px -${(mousePos.y - imageMetrics!.offsetY) * magnification - loupeSize / 2}px`,
                width: '100%',
                height: '100%',
                imageRendering: 'high-quality' as any
              }}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/40 mix-blend-overlay" />
            <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white/20 blur-xl rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
