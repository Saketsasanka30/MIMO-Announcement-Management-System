import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type {
  Announcement,
  AnnouncementFormInput,
  AnnouncementType,
} from '../types/announcement';
import {
  ANNOUNCEMENT_DESCRIPTION_MAX,
  ANNOUNCEMENT_TITLE_MAX,
  formatDateForInput,
  validateAnnouncementInput,
} from '../lib/announcements';

interface AnnouncementEditorPageProps {
  editingAnnouncement: Announcement | null;
  isSaving: boolean;
  onSave: (input: AnnouncementFormInput, editingId?: string) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_FORM = (): AnnouncementFormInput => ({
  title: '',
  description: '',
  type: 'General',
  date: formatDateForInput(new Date()),
  status: 'Published',
});

function TypeFaceSvg({
  type,
  selected,
}: {
  type: AnnouncementType;
  selected: boolean;
}) {
  const strokeColor = selected ? '#6B6B6B' : '#FFFFFF';
  const fillColor = selected ? '#FFFFFF' : 'none';

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 64 64"
      fill="none"
      className="w-14 h-14 transition-transform"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={fillColor}
        stroke={selected ? 'none' : '#FFFFFF'}
        strokeWidth="2.5"
      />
      <circle cx="22" cy="26" r="3" fill={strokeColor} />
      <circle cx="42" cy="26" r="3" fill={strokeColor} />

      {type === 'General' && (
        <path
          d="M20 38c3 5 8 8 12 8s9-3 12-8"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {type === 'Important' && (
        <>
          <path
            d="M17 19l8 2"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M47 19l-8 2"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="32"
            cy="41"
            r="4.5"
            stroke={strokeColor}
            strokeWidth="2.8"
          />
        </>
      )}
      {type === 'Maintenance' && (
        <path
          d="M22 40h20"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function AnnouncementEditorPage({
  editingAnnouncement,
  isSaving,
  onSave,
  onCancel,
}: AnnouncementEditorPageProps) {
  const [form, setForm] = useState<AnnouncementFormInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AnnouncementFormInput, string>>>({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  useEffect(() => {
    if (editingAnnouncement) {
      setForm({
        title: editingAnnouncement.title,
        description: editingAnnouncement.description,
        type: editingAnnouncement.type,
        date: formatDateForInput(editingAnnouncement.date),
        status: editingAnnouncement.status,
      });
    } else {
      setForm(DEFAULT_FORM());
    }
    setErrors({});
    setTouchedSubmit(false);
  }, [editingAnnouncement]);

  const updateField = <K extends keyof AnnouncementFormInput>(
    field: K,
    value: AnnouncementFormInput[K]
  ) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touchedSubmit) {
      const check = validateAnnouncementInput(next);
      setErrors(check.errors);
    }
  };

  const handleReset = () => {
    setErrors({});
    setTouchedSubmit(false);
    if (editingAnnouncement) {
      setForm({
        title: editingAnnouncement.title,
        description: editingAnnouncement.description,
        type: editingAnnouncement.type,
        date: formatDateForInput(editingAnnouncement.date),
        status: editingAnnouncement.status,
      });
    } else {
      setForm(DEFAULT_FORM());
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouchedSubmit(true);
    const validation = validateAnnouncementInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    await onSave(form, editingAnnouncement?.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/25 mb-8">
        <div className="stagger-item stagger-delay-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Admin Dashboard
          </button>
          <h1 className="text-white text-[34px] sm:text-[42px] leading-[1.1] font-normal tracking-[-0.02em]">
            {editingAnnouncement ? 'Edit announcement' : 'Create announcement'}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="stagger-item stagger-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-xs font-medium text-white hover:bg-white/30 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          {editingAnnouncement ? 'Revert changes' : 'Reset fields'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Main Content Column */}
        <div className="stagger-item stagger-delay-2 lg:col-span-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-6 md:p-7 space-y-5 text-white">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="editor-title"
                className="text-base font-normal tracking-[-0.01em] text-white"
              >
                Announcement title
              </label>
              <span className="text-xs text-white/70 tabular-nums">
                {form.title.length} / {ANNOUNCEMENT_TITLE_MAX}
              </span>
            </div>
            <input
              id="editor-title"
              type="text"
              maxLength={ANNOUNCEMENT_TITLE_MAX}
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter a clear, descriptive announcement headline..."
              className="w-full rounded-2xl bg-white/15 border border-white/30 px-4 py-3 text-sm text-white placeholder-white/55 outline-none focus:border-white/70"
            />
            {errors.title && (
              <p className="text-xs text-[#FFE5E5] mt-1.5 font-medium">{errors.title}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="editor-description"
                className="text-base font-normal tracking-[-0.01em] text-white"
              >
                Jot your announcement details
              </label>
              <span className="text-xs text-white/70 tabular-nums">
                {form.description.length} / {ANNOUNCEMENT_DESCRIPTION_MAX}
              </span>
            </div>
            <textarea
              id="editor-description"
              rows={9}
              maxLength={ANNOUNCEMENT_DESCRIPTION_MAX}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Provide full announcement details, dates, affected services, or action items..."
              className="w-full rounded-2xl bg-white/15 border border-white/30 px-4 py-3 text-[15px] leading-relaxed text-white placeholder-white/55 outline-none focus:border-white/70 resize-y min-h-[210px]"
            />
            {errors.description && (
              <p className="text-xs text-[#FFE5E5] mt-1.5 font-medium">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Right Metadata & Publishing Column */}
        <div className="space-y-5 text-white">
          {/* Announcement Type Selector with Signature SVG Faces */}
          <div className="stagger-item stagger-delay-3 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <p className="text-base font-normal tracking-[-0.01em] mb-4">
              What type of notice?
            </p>
            <div className="flex items-center justify-between px-1">
              {(['General', 'Important', 'Maintenance'] as AnnouncementType[]).map((type) => {
                const selected = form.type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('type', type)}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    aria-pressed={selected}
                  >
                    <TypeFaceSvg type={type} selected={selected} />
                    <span
                      className={`text-xs text-white ${
                        selected ? 'font-semibold' : 'font-medium text-white/85'
                      }`}
                    >
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-xs text-[#FFE5E5] mt-2 font-medium">{errors.type}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="stagger-item stagger-delay-4 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <label
              htmlFor="editor-date"
              className="block text-base font-normal tracking-[-0.01em] mb-2.5"
            >
              Announcement date
            </label>
            <div className="relative flex items-center rounded-2xl bg-white/15 border border-white/30 px-3.5 py-2.5">
              <Calendar size={16} className="text-white/80 shrink-0 mr-2.5" />
              <input
                id="editor-date"
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
              />
            </div>
            {errors.date && (
              <p className="text-xs text-[#FFE5E5] mt-2 font-medium">{errors.date}</p>
            )}
          </div>

          {/* Status Toggle Bars */}
          <div className="stagger-item stagger-delay-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-5">
            <p className="text-base font-normal tracking-[-0.01em] mb-3">
              Publication status
            </p>
            <div className="flex items-stretch gap-2">
              {(['Draft', 'Published'] as const).map((statusOption) => {
                const selected = form.status === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => updateField('status', statusOption)}
                    className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-white text-neutral-800 shadow-sm'
                        : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
                    }`}
                    aria-pressed={selected}
                  >
                    {statusOption}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/80 mt-3 leading-relaxed">
              {form.status === 'Published'
                ? 'Visible immediately on the Public Notices page.'
                : 'Saved privately in Firestore inside the Admin Dashboard.'}
            </p>
          </div>

          {/* Submit & Cancel Actions */}
          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-60"
            >
              <span className="text-neutral-800 font-medium text-base">
                {isSaving
                  ? 'Saving...'
                  : editingAnnouncement
                    ? 'Save changes'
                    : form.status === 'Published'
                      ? 'Publish announcement'
                      : 'Save as draft'}
              </span>
              {isSaving ? (
                <Loader2 size={20} className="animate-spin text-neutral-700" />
              ) : (
                <ArrowRight size={20} className="text-neutral-700" />
              )}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
