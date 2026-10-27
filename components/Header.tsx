import React from 'react';

interface HeaderProps {
  viewerTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ viewerTitle }) => {
  return (
    <header className="flex-none z-20 w-full pt-safe px-4 py-2 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Removed Add Photos button */}
      </div>

      {/* Centered Logo / Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-0.5">Lumina Light Table</span>
        </div>
        {viewerTitle ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-50">{viewerTitle}</span>
        ) : null}
      </div>
    </header>
  );
};
