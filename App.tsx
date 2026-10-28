import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Photo } from './types';
import { Header } from './components/Header';
import { PhotoViewer } from './components/PhotoViewer';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { HelpMenu } from './components/HelpMenu';

// In the container layout the viewer lives at <container>/viewer/viewer.html,
// so the gallery name is the folder above the viewer folder.
const galleryFromLocation = (): string => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length < 3) return '';

  const viewerFolder = parts[parts.length - 2];
  const container = parts[parts.length - 3];
  if (viewerFolder.toLowerCase() !== 'viewer' || !container) return '';

  try {
    return decodeURIComponent(container);
  } catch {
    return container;
  }
};

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [galleryPath, setGalleryPath] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnification, setMagnification] = useState(2);
  const [slideDuration, setSlideDuration] = useState(3);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCorsBlocked, setIsCorsBlocked] = useState(false);

  const viewerTitle = useMemo(() => {
    const folderName = galleryPath.split('/').filter(Boolean).pop() ?? '';
    if (!folderName) return '';
    return folderName
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [galleryPath]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rawGallery = urlParams.get('gallery')?.trim() ?? '';
    const explicitGallery = rawGallery.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
    const inferredGallery = galleryFromLocation();

    const candidates = [];
    if (explicitGallery) candidates.push(explicitGallery);
    if (inferredGallery && inferredGallery !== explicitGallery) candidates.push(inferredGallery);

    if (candidates.length === 0) {
      setErrorMessage('No gallery found. Use the container layout <name>/viewer/viewer.html or add ?gallery=<name>.');
      setLoading(false);
      return;
    }

    const load = async () => {
      let lastError = '';

      for (const gallery of candidates) {
        let metaUrl: URL;
        try {
          metaUrl = new URL(`../${gallery}/gallery.json`, window.location.href);
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
          continue;
        }

        try {
          const response = await fetch(metaUrl.toString());
          if (!response.ok) {
            throw new Error(`Gallery metadata not found at ${metaUrl.toString()}`);
          }

          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error(`No photos were found in gallery: ${gallery}`);
          }

          if (explicitGallery && gallery !== explicitGallery) {
            console.warn(`Gallery "${explicitGallery}" could not be loaded; using "${gallery}" instead.`);
          }

          const resolvedPhotos = (data as Photo[]).map((photo) => ({
            ...photo,
            url: new URL(photo.url || '', metaUrl.toString()).toString(),
          }));

          setGalleryPath(gallery);
          setPhotos(resolvedPhotos);
          setActiveIndex(0);
          setSelectedIds(new Set(resolvedPhotos.slice(0, 5).map((p: Photo) => p.id)));
          setLoading(false);
          return;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }

      console.error('Failed to load gallery', lastError);
      setErrorMessage(`Unable to load gallery: ${candidates.join(' or ')}`);
      setLoading(false);
    };

    load();
  }, []);

  const activePhoto = photos[activeIndex] || photos[0];

  const selectedPhotos = useMemo(() => 
    photos.filter(p => selectedIds.has(p.id)),
  [selectedIds, photos]);

  const handleToggleSelection = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(photos.map(p => p.id)));
  }, [photos]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setIsSlideshowActive(false);
  }, []);

  const toggleSlideshow = useCallback(() => {
    if (selectedPhotos.length === 0) return;
    setIsSlideshowActive((prev) => !prev);
    setIsMagnifierActive(false);
  }, [selectedPhotos.length]);

  // Navigation Logic
  const goToNext = useCallback(() => {
    if (photos.length === 0) return;
    setActiveIndex(prev => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrev = useCallback(() => {
    if (photos.length === 0) return;
    setActiveIndex(prev => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // CORS Detection for Magnifier
  useEffect(() => {
    if (!activePhoto) return;
    
    const checkCors = async () => {
      try {
        const response = await fetch(activePhoto.url, { method: 'HEAD', mode: 'cors' });
        setIsCorsBlocked(!response.ok);
      } catch (err) {
        setIsCorsBlocked(true);
      }
    };
    
    checkCors();
  }, [activePhoto]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHelpOpen) {
        if (e.key === 'Escape') setIsHelpOpen(false);
        return;
      }

      switch(e.key) {
        case 'ArrowRight':
          goToNext();
          setIsSlideshowActive(false);
          break;
        case 'ArrowLeft':
          goToPrev();
          setIsSlideshowActive(false);
          break;
        case ' ':
          e.preventDefault();
          toggleSlideshow();
          break;
        case 'm':
        case 'M':
          if (!isCorsBlocked) setIsMagnifierActive(prev => !prev);
          break;
        case 's':
        case 'S':
          if (activePhoto) handleToggleSelection(activePhoto.id);
          break;
        case 'a':
        case 'A':
          handleSelectAll();
          break;
        case 'n':
        case 'N':
        case 'Escape':
          handleDeselectAll();
          break;
        case '?':
          setIsHelpOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, toggleSlideshow, isMagnifierActive, handleToggleSelection, activePhoto, handleSelectAll, handleDeselectAll, isHelpOpen, isCorsBlocked]);

  useEffect(() => {
    let interval: number | undefined;
    if (isSlideshowActive && selectedPhotos.length > 0) {
      if (photos[activeIndex] && !selectedIds.has(photos[activeIndex].id)) {
        const firstSelectedIdx = photos.findIndex(p => p.id === selectedPhotos[0].id);
        setActiveIndex(firstSelectedIdx);
      }

      interval = window.setInterval(() => {
        setActiveIndex((prev) => {
          if (!photos[prev]) return 0;
          const currentId = photos[prev].id;
          const currentInSelected = selectedPhotos.findIndex(p => p.id === currentId);
          const nextSelectedIdx = (currentInSelected + 1) % selectedPhotos.length;
          const nextPhoto = selectedPhotos[nextSelectedIdx];
          return photos.findIndex(p => p.id === nextPhoto.id);
        });
      }, slideDuration * 1000);
    }
    return () => clearInterval(interval);
  }, [isSlideshowActive, selectedPhotos, selectedIds, activeIndex, slideDuration, photos]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background-dark text-white select-none overflow-hidden font-display">
      <Header viewerTitle={viewerTitle} />
      
      <HelpMenu isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xl">Loading gallery...</p>
          </div>
        ) : errorMessage ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4 px-4 text-center">
            <span className="material-symbols-outlined text-8xl">error</span>
            <p className="text-xl">Unable to load gallery</p>
            <p className="max-w-xl text-sm opacity-70">{errorMessage}</p>
            <p className="text-sm opacity-50">Use a valid URL like <code className="bg-white/10 rounded px-1 py-0.5">?gallery=galleries/wedding</code></p>
          </div>
        ) : photos.length > 0 ? (
          <PhotoViewer 
            photo={activePhoto} 
            currentIndex={activeIndex} 
            totalCount={photos.length}
            isSelected={selectedIds.has(activePhoto.id)}
            isMagnifierActive={isMagnifierActive}
            setIsMagnifierActive={setIsMagnifierActive}
            magnification={magnification}
            setMagnification={setMagnification}
            isSlideshowActive={isSlideshowActive}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
            <span className="material-symbols-outlined text-8xl">photo_library</span>
            <p className="text-xl">Gallery folder is empty.</p>
            <p className="text-sm opacity-50">Add images to /public/gallery on the server.</p>
          </div>
        )}

        { !loading && !errorMessage && photos.length > 0 && (
          <>
            <div
              id="thumbnail-strip"
              aria-hidden={isSlideshowActive}
              inert={isSlideshowActive}
              className={`flex-none overflow-hidden transition-all duration-300 ${
                isSlideshowActive ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-48 opacity-100'
              }`}
            >
              <ThumbnailStrip 
                photos={photos}
                selectedIds={selectedIds}
                activeIndex={activeIndex}
                onSelectPhoto={(idx) => {
                  setActiveIndex(idx);
                  setIsSlideshowActive(false);
                }}
                onToggleSelection={handleToggleSelection}
              />
            </div>

            {/* Master Control Bar */}
            <div className="flex-none w-full px-2 sm:px-4 pb-safe pt-0 mb-2 sm:mb-4">
              <div className="flex flex-col bg-neutral-900/80 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden ring-1 ring-white/10 p-1 sm:p-1.5">
                
                <div className="flex items-center gap-1 sm:gap-3 px-1 sm:px-2 h-10 sm:h-12">
                  {/* Home Navigation Icon */}
                  <button 
                    onClick={() => console.log('Navigate Home')}
                className="flex-none flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                  home
                </span>
              </button>

              <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />

              {/* Play/Pause Trigger */}
              <button 
                onClick={toggleSlideshow}
                disabled={selectedPhotos.length === 0}
                className={`flex-none relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all active:scale-90 disabled:opacity-20 ${isSlideshowActive ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary'}`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-white">
                  {isSlideshowActive ? 'stop' : 'play_arrow'}
                </span>
                {isSlideshowActive && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
                )}
              </button>

              {/* Magnifier Integrated Toggle */}
              {!isCorsBlocked && (
                <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 bg-white/[0.03] rounded-full border border-white/5 ml-0.5">
                  <button 
                    onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                    className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full transition-all ${
                      isMagnifierActive ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                      {isMagnifierActive ? 'zoom_out' : 'zoom_in'}
                    </span>
                  </button>
                  {isMagnifierActive && (
                    <div className="flex gap-0.5 animate-in slide-in-from-left-2 duration-300 pr-1">
                      {[2, 4, 8].map(level => (
                        <button
                          key={level}
                          onClick={() => setMagnification(level)}
                          className={`h-6 w-6 flex items-center justify-center rounded-full text-[9px] font-black transition-all ${
                            magnification === level ? 'bg-primary text-white scale-110 shadow-md' : 'text-white/30 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title Column */}
              <div className="flex-1 flex flex-col justify-center min-w-0 px-1 sm:px-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-[11px] sm:text-[14px] font-black tracking-tight text-white uppercase truncate leading-none">
                    {activePhoto?.title}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 hidden sm:flex">
                  <span className="text-[7px] font-black text-white/20 tracking-[0.15em] uppercase truncate">
                    {activeIndex + 1}/{photos.length}
                  </span>
                </div>
              </div>

              {/* Help Toggle Button */}
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="flex-none flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full text-white/20 hover:text-primary transition-all active:scale-90"
                title="Help & Shortcuts"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">help_outline</span>
              </button>

              {/* Selection Summary */}
              <div className="flex flex-col items-end gap-0 px-1.5 sm:px-3 border-l border-white/10">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[11px] sm:text-xs font-black text-white">{selectedIds.size}</span>
                  <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest hidden sm:inline">Selected</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={handleSelectAll}
                    className="flex items-center justify-center text-primary hover:text-white transition-colors active:scale-90"
                    title="Select All"
                  >
                    <span className="sm:hidden material-symbols-outlined text-[14px]">done_all</span>
                    <span className="hidden sm:inline text-[8px] font-black uppercase tracking-widest">All</span>
                  </button>
                  <div className="w-px h-1.5 bg-white/20" />
                  <button 
                    onClick={handleDeselectAll}
                    className="flex items-center justify-center text-white/30 hover:text-red-500 transition-colors active:scale-90"
                    title="Deselect All"
                  >
                    <span className="sm:hidden material-symbols-outlined text-[14px]">close</span>
                    <span className="hidden sm:inline text-[8px] font-black uppercase tracking-widest">None</span>
                  </button>
                </div>
              </div>

              {/* Speed Slider */}
              <div className="flex flex-col gap-0.5 w-14 sm:w-20 px-1 sm:px-3 border-l border-white/10 group">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[6px] font-black text-white/20 tracking-widest uppercase hidden xs:inline">Speed</span>
                  <span className="text-[9px] font-black text-primary ml-auto">{slideDuration}s</span>
                </div>
                <div className="relative h-2.5 flex items-center">
                  <input 
                    type="range" 
                    min="1" 
                    max="8" 
                    step="1"
                    value={slideDuration}
                    onChange={(e) => setSlideDuration(parseInt(e.target.value))}
                    className="w-full accent-primary h-1 bg-white/5 rounded-full cursor-pointer appearance-none outline-none group-hover:bg-white/10 transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
};

export default App;
