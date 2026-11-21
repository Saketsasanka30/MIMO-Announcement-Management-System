import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  Bell,
  Calendar,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Wrench,
  X,
} from 'lucide-react';
import type { Announcement, AnnouncementType } from '../types/announcement';
import { formatDisplayDate } from '../lib/announcements';

type TypeFilter = 'All' | AnnouncementType;

interface PublicNoticesPageProps {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  onSelectAnnouncement: (announcement: Announcement) => void;
}

export function PublicNoticesPage({
  announcements,
  loading,
  error,
  onSelectAnnouncement,
}: PublicNoticesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TypeFilter>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = announcements.filter((item) => {
      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    if (sortOrder === 'oldest') {
      return [...list].sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    return list;
  }, [announcements, searchQuery, selectedType, sortOrder]);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedType !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSortOrder('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/20">
        <div className="stagger-item stagger-delay-1 max-w-2xl">
          <p className="text-white/75 text-sm font-medium mb-2">
            Public announcement feed
          </p>
          <h1 className="text-white text-[40px] sm:text-[52px] leading-[1.06] font-normal tracking-[-0.03em] text-balance">
            Live MIMO updates
          </h1>
          <p className="text-white/75 text-base mt-3 leading-relaxed">
            Stay informed with official operational updates, priority alerts, and scheduled maintenance notices synced in real time.
          </p>
        </div>

        <div className="stagger-item stagger-delay-2 flex items-baseline gap-2.5 shrink-0">
          <span className="text-4xl font-semibold text-white tabular-nums tracking-tight">
            {filteredAnnouncements.length}
          </span>
          <span className="text-sm text-white/75">
            {filteredAnnouncements.length === 1 ? 'published notice' : 'published notices'}
          </span>
        </div>
      </div>

      {/* Glassmorphic Search, Filter & Sort Toolbar */}
      <div className="py-6 flex flex-col gap-4">
        <div className="stagger-item stagger-delay-3 relative w-full bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center px-4 py-2.5">
          <Search size={17} className="text-white/75 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements by title or description..."
            aria-label="Search announcements by title or description"
            className="w-full bg-transparent text-sm text-white placeholder-white/60 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-white/75 hover:text-white cursor-pointer p-0.5 ml-2"
              aria-label="Clear search query"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5">
          <div className="overflow-x-auto no-scrollbar w-full sm:w-auto">
            <div
              className="stagger-item stagger-delay-3 inline-flex items-center gap-1 p-1 bg-white/20 backdrop-blur-md rounded-full border border-white/15 min-w-max"
              role="group"
              aria-label="Filter announcements by type"
            >
              {(['All', 'General', 'Important', 'Maintenance'] as TypeFilter[]).map((type) => {
                const active = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-neutral-800 shadow-sm'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="stagger-item stagger-delay-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-white hover:bg-white/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowDownUp size={14} />
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-neutral-800 text-xs sm:text-sm font-medium shadow-md hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20 flex flex-col items-center justify-center text-center text-white">
          <Loader2 size={28} className="animate-spin mb-3 text-white/90" />
          <p className="text-base font-medium">Loading published announcements...</p>
          <p className="text-sm text-white/75 mt-1">Syncing live updates from Firestore</p>
        </div>
      ) : error ? (
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-[#F5B5B6]/45 text-white max-w-xl">
          <div className="flex items-center gap-2.5 text-[#FFE4E5] font-semibold text-base mb-2">
            <AlertTriangle size={20} />
            <span>Unable to load published announcements</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed mb-5">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
            Reload feed
          </button>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="stagger-item stagger-delay-4 bg-white/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Bell size={22} />
          </div>
          <h2 className="text-xl font-medium">
            {hasActiveFilters ? 'No matching announcements' : 'No published announcements yet'}
          </h2>
          <p className="text-sm text-white/75 mt-1.5 max-w-md mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'No published notices matched your search query or selected category filter.'
              : 'New notices published by MIMO administrators will appear here automatically in real time.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnnouncements.map((item, idx) => {
            const isImportant = item.type === 'Important';
            const isMaintenance = item.type === 'Maintenance';
            const delayClass = `stagger-delay-${Math.min((idx % 4) + 4, 8)}`;

            const cardSurface = isImportant
              ? 'bg-[#5a2f32]/30 border-[#F5B5B6]/45 hover:bg-[#5a2f32]/40'
              : isMaintenance
                ? 'bg-white/20 border-[#CBD89E]/45 hover:bg-white/25'
                : 'bg-white/20 border-white/20 hover:bg-white/25';

            const categoryTone = isImportant
              ? 'text-[#FFE4E5]'
              : isMaintenance
                ? 'text-[#E7F0C7]'
                : 'text-white';

            const CategoryIcon = isImportant
              ? AlertTriangle
              : isMaintenance
                ? Wrench
                : Info;

            return (
              <article
                key={item.id}
                className={`stagger-item ${delayClass} backdrop-blur-xl rounded-3xl p-6 border flex flex-col justify-between transition-colors ${cardSurface}`}
              >
                <div>
                  <div className="flex items-center flex-wrap gap-2 text-xs mb-3">
                    <span className={`inline-flex items-center gap-1.5 font-semibold ${categoryTone}`}>
                      <CategoryIcon size={14} />
                      {item.type}
                    </span>
                    <span className="text-white/45" aria-hidden="true">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-white/80 tabular-nums">
                      <Calendar size={13} />
                      {formatDisplayDate(item.date)}
                    </span>
                  </div>

                  <h2 className="text-xl font-medium text-white leading-snug mb-2.5 break-words">
                    {item.title}
                  </h2>

                  <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-white/15 flex items-center justify-between gap-4">
                  <span className="text-xs text-white/70 truncate italic">
                    {item.authorEmail ? `Posted by ${item.authorEmail}` : 'MIMO Administration'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectAnnouncement(item)}
                    className="w-11 h-11 rounded-full bg-white text-neutral-800 shadow-lg flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                    aria-label={`Read full announcement: ${item.title}`}
                    title="Open full announcement"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
