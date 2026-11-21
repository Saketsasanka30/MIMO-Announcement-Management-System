import { Compass, Heart } from 'lucide-react';
import type { PageTab } from './Navbar';

interface FooterProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export function Footer({ activeTab, onSelectTab }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-black/20 backdrop-blur-md mt-auto py-8 sm:py-12 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60 font-light">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[#CBD89E]">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-white tracking-tight text-sm">
              Soul Canvas
            </span>
          </div>
          <span className="hidden sm:inline text-white/30">|</span>
          <p className="text-white/70">
            A sanctuary for mindful cadence, conscious stillness & emotional equilibrium.
          </p>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#CBD89E] font-medium' : 'hover:text-white'
            }`}
          >
            Check-in
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('insights')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'insights' ? 'text-[#CBD89E] font-medium' : 'hover:text-white'
            }`}
          >
            Insights
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('journal')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'journal' ? 'text-[#CBD89E] font-medium' : 'hover:text-white'
            }`}
          >
            Mood Journal
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('announcements')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'announcements' ? 'text-[#CBD89E] font-medium' : 'hover:text-white'
            }`}
          >
            Notices & Portal
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-[#F5B5B6] fill-current" />
          <span>for inner peace</span>
        </div>
      </div>
    </footer>
  );
}
