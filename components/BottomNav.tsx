
import React from 'react';

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('library');

  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'library', icon: 'grid_view', label: 'Library' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav className="flex-none flex justify-around items-center border-t border-border-dark bg-nav-dark px-4 pb-safe pt-2 h-[80px] z-30">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === item.id 
              ? 'text-primary' 
              : 'text-text-muted hover:text-white'
          }`}
        >
          <div className={`flex items-center justify-center h-8 w-12 rounded-full transition-colors ${
            activeTab === item.id ? 'bg-primary/20' : ''
          }`}>
            <span className={`material-symbols-outlined text-[24px] ${
              activeTab === item.id ? 'fill-current' : ''
            }`}>
              {item.icon}
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
