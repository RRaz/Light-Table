import React from 'react';

interface HelpMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpMenu: React.FC<HelpMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Keyboard',
      icon: 'keyboard',
      items: [
        { key: '← / →', desc: 'Previous / Next Photo' },
        { key: 'Space', desc: 'Play / Pause Slideshow' },
        { key: 'M', desc: 'Toggle Magnifier' },
        { key: 'S', desc: 'Toggle Selection' },
        { key: 'A', desc: 'Select All' },
        { key: 'Esc', desc: 'Deselect All / Close Help' },
      ]
    },
    {
      title: 'Mouse & Touch',
      icon: 'touch_app',
      items: [
        { key: 'Click/Tap', desc: 'Select Photo to view' },
        { key: 'Checkmark', desc: 'Toggle photo selection' },
        { key: 'Hover/Drag', desc: 'Magnify (if active)' },
        { key: 'Scroll', desc: 'Navigate Thumbnail Strip' },
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-neutral-900/90 border border-white/10 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.8)] p-6 sm:p-8 overflow-hidden ring-1 ring-white/5 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined">help_center</span>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Shortcuts</h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Master the Light Table</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[18px]">{section.icon}</span>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">{section.title}</h3>
              </div>
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between group">
                    <span className="text-[11px] font-black text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-wider">{item.desc}</span>
                    <kbd className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-black text-primary uppercase shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Lumina Professional v2.5</p>
        </div>
      </div>
    </div>
  );
};
