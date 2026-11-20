import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import type { Announcement, ToastNotification } from '../types/announcement';
import { formatDisplayDate } from '../lib/announcements';

interface ToastStackProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const icon =
          toast.variant === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : toast.variant === 'error' ? (
            <XCircle size={18} className="text-rose-600 shrink-0" />
          ) : (
            <Info size={18} className="text-slate-700 shrink-0" />
          );

        const borderTone =
          toast.variant === 'success'
            ? 'border-emerald-200 bg-white'
            : toast.variant === 'error'
              ? 'border-rose-200 bg-white'
              : 'border-neutral-200 bg-white';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg ${borderTone}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 leading-snug">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface DeleteConfirmDialogProps {
  announcement: Announcement | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  announcement,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="min-w-0">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-neutral-900">
              Delete announcement?
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              This will permanently remove the announcement from Firestore and cannot be undone.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 mb-5">
          <p className="text-xs font-medium text-neutral-500">
            {announcement.type} · {announcement.status} · {formatDisplayDate(announcement.date)}
          </p>
          <p className="text-sm font-semibold text-neutral-900 mt-1 break-words">
            {announcement.title}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isDeleting && <Loader2 size={15} className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  onClose: () => void;
}

export function AnnouncementDetailModal({
  announcement,
  onClose,
}: AnnouncementDetailModalProps) {
  if (!announcement) return null;

  const typeTone =
    announcement.type === 'Important'
      ? 'text-rose-700'
      : announcement.type === 'Maintenance'
        ? 'text-amber-800'
        : 'text-neutral-700';

  const TypeIcon =
    announcement.type === 'Important'
      ? AlertTriangle
      : announcement.type === 'Maintenance'
        ? Wrench
        : Bell;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dialog-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <span className={`inline-flex items-center gap-1.5 ${typeTone}`}>
              <TypeIcon size={14} />
              {announcement.type}
            </span>
            <span className="text-neutral-300" aria-hidden="true">
              ·
            </span>
            <span className="text-neutral-600">{announcement.status}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close announcement details"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="detail-dialog-title"
          className="text-xl font-semibold text-neutral-900 leading-snug mb-2 break-words"
        >
          {announcement.title}
        </h2>

        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
          <Calendar size={14} />
          <span>{formatDisplayDate(announcement.date)}</span>
          {announcement.authorEmail && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{announcement.authorEmail}</span>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words">
          {announcement.description}
        </div>

        <div className="pt-5 mt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
