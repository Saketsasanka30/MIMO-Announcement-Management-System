import { Sparkles, Play, ArrowUpRight, Wind, Heart, Sun, Flame, CheckCircle2 } from 'lucide-react';

interface HomeSectionProps {
  onNavigateToInsights: () => void;
  onNavigateToJournal: () => void;
}

export function HomeSection({
  onNavigateToInsights,
  onNavigateToJournal,
}: HomeSectionProps) {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 md:py-14 flex flex-col justify-between min-h-[calc(100vh-100px)]">
      {/* Top Editorial Subtitle & Date Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-medium text-[#CBD89E] tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-[#CBD89E]" />
            Sanctuary Open
          </span>
          <span className="text-white/60 text-xs sm:text-sm font-light tracking-wide">
            Circadian Wave · Cycle 14
          </span>
        </div>

        <div className="text-xs sm:text-sm text-white/70 font-light flex items-center gap-2">
          <span>Solstice Dawn</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>7:14 AM</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="text-[#CBD89E]">Coherent Grounding</span>
        </div>
      </div>

      {/* Hero Typography Section */}
      <div className="my-8 sm:my-12 md:my-16 max-w-4xl animate-fade-in delay-100">
        <h1 className="text-white font-sans font-normal leading-[1.04] tracking-[-0.035em] text-[36px] sm:text-[48px] md:text-[62px] lg:text-[76px] xl:text-[86px] text-balance">
          Attune to the quiet pulse of your living canvas.
        </h1>
        <p className="mt-5 sm:mt-7 text-white/80 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl text-balance">
          A tranquil vessel for morning stillness, ambient emotional resonance, and unhurried reflections designed to nourish your inner architecture.
        </p>

        {/* Action pills row */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToJournal}
            className="px-6 py-3.5 rounded-full bg-white text-neutral-900 text-xs sm:text-sm font-medium tracking-wide shadow-xl hover:bg-neutral-100 hover:shadow-2xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer group"
          >
            <span>Begin Daily Check-in</span>
            <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={onNavigateToInsights}
            className="px-5 py-3.5 rounded-full glass-panel-interactive text-white text-xs sm:text-sm font-medium tracking-wide flex items-center gap-2 cursor-pointer group"
          >
            <span>View Resonance Waves</span>
            <ArrowUpRight className="w-4 h-4 text-[#CBD89E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Two Balanced Feature Cards Composition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 my-6 animate-fade-in delay-200">
        {/* Feature Card 1: Guided Breath Practice */}
        <div className="glass-panel-interactive rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] border border-white/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#CBD89E]/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-[#CBD89E]/20" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#CBD89E] text-xs font-medium tracking-wider uppercase border border-white/15">
                <Wind className="w-3.5 h-3.5" />
                Somatic Soundscape
              </span>
              <span className="text-white/60 text-xs font-light">
                12 min flow
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-[-0.02em] leading-snug">
              Coherence Breath & Pine Reverie
            </h3>
            <p className="mt-2.5 text-sm sm:text-base text-white/75 font-light leading-relaxed">
              Gentle 4-7-8 harmonic rhythms accompanied by wind whispering through coastal pines. Calms autonomic tension in minutes.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#CBD89E]/40 border border-white/30 flex items-center justify-center text-[10px] text-white">4s</div>
                <div className="w-6 h-6 rounded-full bg-[#F5B5B6]/40 border border-white/30 flex items-center justify-center text-[10px] text-white">7s</div>
                <div className="w-6 h-6 rounded-full bg-[#CBD89E]/40 border border-white/30 flex items-center justify-center text-[10px] text-white">8s</div>
              </div>
              <span className="text-xs text-white/70 font-light">Paced Pranayama</span>
            </div>

            <button
              type="button"
              aria-label="Play soundscape session"
              className="w-11 h-11 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-[#CBD89E] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Feature Card 2: Inner Harmony & Today's Vitality Status */}
        <div className="glass-panel-interactive rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] border border-white/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#F5B5B6]/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-[#F5B5B6]/20" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F5B5B6] text-xs font-medium tracking-wider uppercase border border-white/15">
                <Heart className="w-3.5 h-3.5" />
                Equilibrium Index
              </span>
              <span className="text-xs text-[#CBD89E] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Alignment
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-[-0.02em] leading-snug">
              Atmospheric Stillness: 88%
            </h3>
            <p className="mt-2.5 text-sm sm:text-base text-white/75 font-light leading-relaxed">
              Your autonomic equilibrium is elevated today. A calm morning heart-rate variance suggests readiness for deep contemplation.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Sun className="w-3.5 h-3.5 text-[#CBD89E]" />
                <span>Lucid Mind</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Flame className="w-3.5 h-3.5 text-[#F5B5B6]" />
                <span>Steady Fire</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToJournal}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-xs text-white font-medium transition-all duration-300 cursor-pointer"
            >
              Record Reflection
            </button>
          </div>
        </div>
      </div>

      {/* Lightweight Ambient Footer Note */}
      <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 font-light">
        <p className="italic font-serif text-white/75">
          "The soul should always stand ajar, ready to welcome the ecstatic experience." — Emily Dickinson
        </p>
        <div className="flex items-center gap-4 text-[11px] tracking-wider uppercase text-white/50">
          <span>Field Resonance: 432 Hz</span>
          <span>·</span>
          <span>Binaural Depth: Alpha</span>
        </div>
      </div>
    </section>
  );
}
