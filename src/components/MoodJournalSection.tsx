import { useState } from 'react';
import { Calendar, Plus, Minus, ArrowRight, Sparkles, Check, Heart, Feather, BookOpen } from 'lucide-react';

type MoodType = 'serene' | 'radiant' | 'grounded' | 'reflective';

interface MoodItem {
  id: MoodType;
  label: string;
  sub: string;
  color: string;
}

const MOODS: MoodItem[] = [
  { id: 'serene', label: 'Serene', sub: 'Calm & Still', color: '#CBD89E' },
  { id: 'radiant', label: 'Radiant', sub: 'Joyful & Open', color: '#F5B5B6' },
  { id: 'grounded', label: 'Grounded', sub: 'Rooted & Steady', color: '#CBD89E' },
  { id: 'reflective', label: 'Reflective', sub: 'Gentle Depths', color: '#CBD89E' },
];

function ExpressiveFaceSvg({ type, selected }: { type: MoodType; selected: boolean }) {
  const stroke = selected ? '#1f2416' : '#ffffff';
  const fill = selected ? '#ffffff' : 'none';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-500"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={fill}
        stroke={selected ? 'none' : '#ffffff'}
        strokeWidth="2.5"
      />
      {type === 'serene' && (
        <>
          <path d="M20 28c2-2.5 5-2.5 7 0" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M37 28c2-2.5 5-2.5 7 0" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M23 39c3 3.5 6 4 9 4s6-.5 9-4" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {type === 'radiant' && (
        <>
          <circle cx="23" cy="27" r="3" fill={stroke} />
          <circle cx="41" cy="27" r="3" fill={stroke} />
          <path d="M21 38c3 5 7 7 11 7s8-2 11-7" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M17 19l4 2.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M47 19l-4 2.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {type === 'grounded' && (
        <>
          <path d="M20 28h8" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 28h8" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 40h16" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {type === 'reflective' && (
        <>
          <circle cx="23" cy="27" r="2.5" fill={stroke} />
          <circle cx="41" cy="27" r="2.5" fill={stroke} />
          <path d="M24 40c2 1.5 5 2 8 2s6-.5 8-2" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function MoodJournalSection() {
  const [selectedMood, setSelectedMood] = useState<MoodType>('serene');
  const [vitalityLevel, setVitalityLevel] = useState<number>(4);
  const [journalContent, setJournalContent] = useState<string>(
    'The morning mist settled gently over the pines. Breathing in the cold air reminded me that peace is not the absence of sound, but an unhurried heart amidst it all.'
  );
  const [entrySubmitted, setEntrySubmitted] = useState<boolean>(false);

  const vitalityLabels = [
    'Restorative Lull',
    'Quiet Awakening',
    'Harmonic Balance',
    'Radiant Flow',
    'Peak Vitality',
  ];

  const handleDecreaseVitality = () => {
    setVitalityLevel((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseVitality = () => {
    setVitalityLevel((prev) => Math.min(5, prev + 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntrySubmitted(true);
    setTimeout(() => setEntrySubmitted(false), 3500);
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 md:py-14 flex flex-col justify-between min-h-[calc(100vh-100px)] animate-fade-in">
      <div className="pb-8 sm:pb-12 border-b border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-medium text-[#CBD89E] tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-[#CBD89E]" />
            Reflective Space
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 font-light">
            <Calendar className="w-3.5 h-3.5 text-[#CBD89E]" />
            <span>Today's Log · Morning Solitude</span>
          </div>
        </div>

        <h1 className="text-white font-sans font-normal leading-[1.05] tracking-[-0.035em] text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] max-w-4xl text-balance">
          Inscribe your presence on the canvas of today.
        </h1>
        <p className="mt-4 sm:mt-5 text-white/80 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl text-balance">
          Select the mood that holds your essence right now, gauge your energetic flame, and leave an unhurried inscription for your future self.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 sm:my-12 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest text-[#CBD89E] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Resonant State
              </span>
              <span className="text-xs text-white/60 font-light">Select one</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`flex flex-col items-center p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-white/25 border-white shadow-xl scale-[1.02]'
                        : 'bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/30'
                    }`}
                  >
                    <ExpressiveFaceSvg type={m.id} selected={isSelected} />
                    <span
                      className={`mt-3 text-sm font-medium ${
                        isSelected ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {m.label}
                    </span>
                    <span className="text-[11px] text-white/60 font-light mt-0.5">
                      {m.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 relative shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[#CBD89E]">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white tracking-tight">
                    Heart Inscription
                  </h3>
                  <p className="text-xs text-white/60 font-light">
                    Prompt: What anchored your heart in stillness today?
                  </p>
                </div>
              </div>

              <span className="text-xs text-white/50 font-light hidden sm:inline">
                Markdown Supported
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={6}
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Write whatever flows... no judgment, only awareness."
                className="w-full bg-white/10 rounded-2xl border border-white/25 p-4 sm:p-5 text-sm sm:text-base text-white placeholder-white/40 leading-relaxed outline-none focus:border-white/60 focus:bg-white/15 transition-all resize-y min-h-[170px]"
              />
              <div className="flex items-center justify-between mt-2 px-1 text-xs text-white/50 font-light">
                <span>Freeform Stream of Consciousness</span>
                <span>{journalContent.length} characters</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Heart className="w-4 h-4 text-[#F5B5B6]" />
                <span>Saved privately to your personal constellation</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-neutral-900 font-medium text-sm tracking-wide shadow-xl hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
              >
                {entrySubmitted ? (
                  <>
                    <Check className="w-4 h-4 text-[#4C5930]" />
                    <span>Inscribed in Sanctuary</span>
                  </>
                ) : (
                  <>
                    <span>Inscribe Entry</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel-interactive rounded-3xl p-6 sm:p-8 border border-white/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest text-[#CBD89E] font-medium">
                Vitality Meter
              </span>
              <span className="text-xs text-white/70 font-medium">
                Level {vitalityLevel} / 5
              </span>
            </div>

            <div className="text-center my-4">
              <p className="text-2xl font-normal text-white tracking-tight">
                {vitalityLabels[vitalityLevel - 1]}
              </p>
              <p className="text-xs text-white/60 font-light mt-1">
                Autonomic energetic reservoir
              </p>
            </div>

            <div className="flex items-end justify-center gap-3 sm:gap-4 h-44 py-4 px-2 my-4 bg-white/5 rounded-2xl border border-white/10">
              {[1, 2, 3, 4, 5].map((bar) => {
                const isActive = bar <= vitalityLevel;
                const heights = ['28%', '45%', '65%', '85%', '100%'];
                return (
                  <div key={bar} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                    <div
                      onClick={() => setVitalityLevel(bar)}
                      className={`w-full max-w-[28px] rounded-full transition-all duration-500 cursor-pointer relative group ${
                        isActive
                          ? 'bg-gradient-to-t from-[#CBD89E]/60 to-[#CBD89E] shadow-lg shadow-[#CBD89E]/20'
                          : 'bg-white/15 hover:bg-white/25'
                      }`}
                      style={{ height: heights[bar - 1] }}
                    >
                      {bar === vitalityLevel && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-sm ring-2 ring-[#CBD89E]" />
                      )}
                    </div>
                    <span className="text-[10px] text-white/50 font-light">{bar}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/15">
              <span className="text-xs text-white/70 font-light">Modulate Vitality</span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecreaseVitality}
                  disabled={vitalityLevel <= 1}
                  aria-label="Decrease vitality level"
                  className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleIncreaseVitality}
                  disabled={vitalityLevel >= 5}
                  aria-label="Increase vitality level"
                  className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/20 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-[#F5B5B6] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Somatic Tip
            </span>
            <h4 className="text-base font-normal text-white leading-snug">
              Notice the gentle release when writing.
            </h4>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              When we translate an emotion into text, the amygdala downregulates sympathetic intensity by up to 23%.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
