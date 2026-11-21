import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Eye,
  FileText,
  Globe,
  Info,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  Announcement,
  AnnouncementStatus,
  AnnouncementType,
  DashboardStats,
} from '../types/announcement';
import { formatDisplayDate } from '../lib/announcements';
import { signOutAccount } from '../lib/auth';

interface AdminDashboardPageProps {
  user: User;
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  stats: DashboardStats;
  onViewAnnouncement: (item: Announcement) => void;
  onEditAnnouncement: (item: Announcement) => void;
  onDeleteRequest: (item: Announcement) => void;
  onToggleStatus: (item: Announcement) => Promise<void>;
  onCreateNew: () => void;
  onSignOut: () => void;
  onNotify: (variant: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export function AdminDashboardPage({
  user,
  announcements,
  loading,
  error,
  stats,
  onViewAnnouncement,
  onEditAnnouncement,
  onDeleteRequest,
  onToggleStatus,
  onCreateNew,
  onSignOut,
  onNotify,
}: AdminDashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AnnouncementStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | AnnouncementType>('All');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return announcements.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesStatus && matchesType && matchesQuery;
    });
  }, [announcements, searchQuery, statusFilter, typeFilter]);

  const handleSignOut = async () => {
    try {
      await signOutAccount();
      onSignOut();
      onNotify('info', 'Signed out', 'Admin session ended.');
    } catch (err) {
      onNotify('error', 'Sign out failed', err instanceof Error ? err.message : 'Unable to sign out.');
    }
  };

  const handleToggle = async (item: Announcement) => {
    setTogglingId(item.id);
    try {
      await onToggleStatus(item);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/20">
        <div className="stagger-item stagger-delay-1">
          <p className="text-sm font-medium text-white/75 mb-1.5">
            MIMO Administration · {user.email}
          </p>
          <h1 className="text-white text-[38px] sm:text-[46px] leading-[1.06] font-normal tracking-[-0.03em]">
            Admin dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSignOut}
            className="stagger-item stagger-delay-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-sm font-medium text-white hover:bg-white/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut size={15} />
            Sign Out
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="stagger-item stagger-delay-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={16} />
            Create announcement
          </button>
        </div>
      </div>

      {/* Admin Details Card */}
      <section aria-label="Administrator details" className="pt-6">
        <div className="stagger-item stagger-delay-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/15">
            <div>
              <p className="text-xs font-medium text-white/70">Admin details</p>
              <h2 className="text-lg font-medium text-white mt-0.5">
                {user.displayName || 'MIMO Administrator'}
              </h2>
            </div>
            <p className="text-xs text-[#CBD89E] font-medium">
              Administrator · Active
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-sm">
            <div>
              <p className="text-xs text-white/65">Administrator Email</p>
              <p className="text-white font-medium mt-0.5 truncate">{user.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-white/65">Administrator ID</p>
              <p className="text-white/90 font-mono text-xs mt-1 truncate tabular-nums">
                {user.uid}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/65">Public Feed Sync</p>
              <p className="text-[#CBD89E] font-medium mt-0.5">
                Live changes visible to all users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Overview Summary Cards */}
      <section aria-label="Announcement statistics" className="py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="stagger-item stagger-delay-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <p className="text-xs font-medium text-white/75">Total announcements</p>
            <p className="text-3xl font-semibold text-[#CBD89E] mt-2 tabular-nums">
              {stats.total}
            </p>
          </div>

          <div className="stagger-item stagger-delay-3 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <p className="text-xs font-medium text-white/75">Published</p>
            <p className="text-3xl font-semibold text-[#CBD89E] mt-2 tabular-nums">
              {stats.published}
            </p>
          </div>

          <div className="stagger-item stagger-delay-4 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <p className="text-xs font-medium text-white/75">General</p>
            <p className="text-3xl font-semibold text-white mt-2 tabular-nums">
              {stats.general}
            </p>
          </div>

          <div className="stagger-item stagger-delay-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <p className="text-xs font-medium text-white/75">Important</p>
            <p className="text-3xl font-semibold text-[#F5B5B6] mt-2 tabular-nums">
              {stats.important}
            </p>
          </div>

          <div className="stagger-item stagger-delay-6 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5 col-span-2 sm:col-span-1">
            <p className="text-xs font-medium text-white/75">Maintenance</p>
            <p className="text-3xl font-semibold text-[#CBD89E] mt-2 tabular-nums">
              {stats.maintenance}
            </p>
          </div>
        </div>
      </section>

      {/* Management Toolbar */}
      <div className="pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="stagger-item stagger-delay-4 relative flex-1 max-w-md bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center px-4 py-2.5">
          <Search size={16} className="text-white/70 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all announcements..."
            aria-label="Search admin announcements"
            className="w-full bg-transparent text-sm text-white placeholder-white/55 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-white/70 hover:text-white cursor-pointer ml-2"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="stagger-item stagger-delay-4 inline-flex items-center gap-1 p-1 bg-white/20 backdrop-blur-xl rounded-full border border-white/20">
            {(['All', 'Published', 'Draft'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-white text-neutral-800 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="stagger-item stagger-delay-4 inline-flex items-center gap-1 p-1 bg-white/20 backdrop-blur-xl rounded-full border border-white/20">
            {(['All', 'General', 'Important', 'Maintenance'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  typeFilter === type
                    ? 'bg-white text-neutral-800 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Management Table */}
      {loading ? (
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-12 flex flex-col items-center justify-center text-center text-white">
          <Loader2 size={26} className="animate-spin mb-3" />
          <p className="text-sm font-medium">Loading announcements from Firestore...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-[#F5B5B6]/45 p-6 text-white text-sm">
          <p className="font-semibold text-[#FFE4E5] mb-1">Firestore synchronization error</p>
          <p className="text-white/80">{error}</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-12 text-center text-white">
          <h2 className="text-lg font-medium">No announcements found</h2>
          <p className="text-sm text-white/75 mt-1 mb-5">
            {announcements.length === 0
              ? 'Create your first MIMO announcement to get started.'
              : 'Try clearing your search or status filters.'}
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Create announcement
          </button>
        </div>
      ) : (
        <div className="stagger-item stagger-delay-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 bg-black/10 text-xs font-medium text-white/75">
                  <th className="py-4 px-6">Announcement</th>
                  <th className="py-4 px-4 whitespace-nowrap">Type</th>
                  <th className="py-4 px-4 whitespace-nowrap">Date</th>
                  <th className="py-4 px-4 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15 text-sm text-white">
                {filteredList.map((item) => {
                  const isPublished = item.status === 'Published';
                  const isBusy = togglingId === item.id;

                  const TypeIcon =
                    item.type === 'Important'
                      ? AlertTriangle
                      : item.type === 'Maintenance'
                        ? Wrench
                        : Info;

                  const typeColor =
                    item.type === 'Important'
                      ? 'text-[#F5B5B6]'
                      : item.type === 'Maintenance'
                        ? 'text-[#CBD89E]'
                        : 'text-white/90';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/10 transition-colors align-top"
                    >
                      <td className="py-4 px-6 max-w-md">
                        <p className="font-medium text-white leading-snug break-words">
                          {item.title}
                        </p>
                        <p className="text-xs text-white/75 mt-1 line-clamp-2 leading-relaxed break-words">
                          {item.description}
                        </p>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${typeColor}`}>
                          <TypeIcon size={14} />
                          {item.type}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-white/80 tabular-nums">
                        {formatDisplayDate(item.date)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isPublished ? 'text-[#CBD89E]' : 'text-[#F5B5B6]'
                          }`}
                        >
                          {isPublished ? <Globe size={13} /> : <FileText size={13} />}
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewAnnouncement(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:bg-white/15 transition-colors cursor-pointer"
                            title="View announcement"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggle(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50"
                            title={isPublished ? 'Move to Draft' : 'Publish announcement'}
                          >
                            {isBusy ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : isPublished ? (
                              <FileText size={14} />
                            ) : (
                              <Globe size={14} />
                            )}
                            {isPublished ? 'Set Draft' : 'Publish'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditAnnouncement(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#CBD89E] hover:bg-white/15 transition-colors cursor-pointer"
                            title="Edit announcement"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteRequest(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#F5B5B6] hover:bg-[#F5B5B6]/20 transition-colors cursor-pointer"
                            title="Delete announcement"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
