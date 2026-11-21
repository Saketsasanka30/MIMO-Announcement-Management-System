import { useState } from 'react';
import { Search, Compass, Sparkles, Volume2, VolumeX, Menu, X, Bell } from 'lucide-react';

export type PageTab = 'home' | 'insights' | 'journal' | 'announcements';

interface NavbarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  userEmail?: string | null;
  isAdmin?: boolean;
}

export function Navbar({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  userEmail,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageTab; label: string; subtitle: string }[] = [
    { id: 'home', label: 'Daily Check-in', subtitle: 'Inner Sanctuary' },
    { id: 'insights', label: 'Insights & Patterns', subtitle: 'Emotional Clarity' },
    { id: 'journal', label: 'Mood Journal', subtitle: 'Reflective Space' },
    { id: 'announcements', label: 'Notices & Portal', subtitle: 'MIMO Announcements' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-12 pt-4 pb-2 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto">
          <nav
            aria-label="Primary Navigation"
            className="glass-panel rounded-full px-5 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between shadow-2xl transition-all duration-500"
          >
            {/* Logo */}
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-105 group-hover:bg-white/30">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#CBD89E] transition-transform duration-700 group-hover:rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg tracking-tight font-medium text-white font-sans leading-none">
                  Soul Canvas
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-sans mt-0.5 hidden xs:inline">
                  Wellness Sanctuary
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`relative px-3.5 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-neutral-900 shadow-md scale-100'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.id === 'announcements' && <Bell className="w-3.5 h-3.5 opacity-80" />}
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#CBD89E]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Soundscape Ambient Indicator */}
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute ambient soundscape' : 'Mute ambient soundscape'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 cursor-pointer"
                title={isMuted ? 'Atmospheric audio muted' : 'Atmospheric audio active'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#CBD89E]" />
                )}
              </button>

              {/* Search Icon */}
              <button
                type="button"
                aria-label="Search mindful practices and reflections"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
              </button>

              {/* Profile Avatar */}
              <div className="flex items-center gap-2 pl-1 border-l border-white/20 ml-1">
                <div
                  onClick={() => onSelectTab('announcements')}
                  className="relative group cursor-pointer flex items-center gap-2"
                  title={userEmail ? `Signed in as ${userEmail}` : 'Portal Account'}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/40 shadow-inner bg-gradient-to-tr from-[#CBD89E]/40 to-[#F5B5B6]/40 flex items-center justify-center p-0.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="Mindful Member Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#CBD89E] rounded-full ring-2 ring-neutral-900" />
                </div>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                className="md:hidden w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white cursor-pointer ml-1"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-40 animate-fade-in">
          <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/25 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-3 border-b border-white/15 px-2">
              <span className="text-xs uppercase tracking-widest text-[#CBD89E] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Sanctuary Portals
              </span>
              <span className="text-xs text-white/60">4 Destinations</span>
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-neutral-900 font-medium shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className={`text-xs ${isActive ? 'text-neutral-500' : 'text-white/60'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#4C5930]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
