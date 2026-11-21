import { Compass, Moon, Sparkles, Feather, Waves, TrendingUp, TrendingDown, ArrowRight, Share2, Layers } from 'lucide-react';

interface InsightsSectionProps {
  onNavigateToJournal: () => void;
}

export function InsightsSection({ onNavigateToJournal }: InsightsSectionProps) {
  const insightCards = [
    {
      id: 1,
      category: 'Clarity & Calm Drift',
      icon: Feather,
      metric: '+18%',
      trend: 'increase',
      tone: 'positive',
      title: 'Dawn Meditation Resonance',
      description:
        'Consistent morning stillness over 7 cycles has shifted your baseline cognitive friction downwards, bringing unhurried perspective during high-demand hours.',
      statLabel: 'Morning Stillness Ratio',
      statValue: '86% Coherent',
      accentColor: '#CBD89E',
    },
    {
      id: 2,
      category: 'Vitality Dynamics',
      icon: Waves,
      metric: '+12%',
      trend: 'increase',
      tone: 'positive',
      title: 'Midday Harmonic Elevation',
      description:
        'Autonomic recovery intervals taken between 1:00 PM and 3:00 PM reliably elevate creative focus and physical stamina through the twilight period.',
      statLabel: 'Afternoon Equilibrium',
      statValue: '4.8 / 5 Vitality',
      accentColor: '#CBD89E',
    },
    {
      id: 3,
      category: 'Circadian Architecture',
      icon: Moon,
      metric: '94%',
      trend: 'stable',
      tone: 'positive',
      title: 'Deep Restorative Immersion',
      description:
        'Evening screen transitions at dusk have expanded delta wave sleep latency by 38 minutes, stabilizing emotional processing upon waking.',
      statLabel: 'Restorative Sleep Depth',
      statValue: '7.8 hrs avg',
      accentColor: '#CBD89E',
    },
    {
      id: 4,
      category: 'Stress Modulation',
      icon: Sparkles,
      metric: '-34%',
      trend: 'decrease',
      tone: 'nuanced',
      title: 'Cognitive Friction Dissolution',
      description:
        'Somatic breathing sessions quickly softened intermittent sympathetic spikes during the mid-week transition, preventing emotional depletion.',
      statLabel: 'Sympathetic Activation',
      statValue: 'Low Amplitude',
      accentColor: '#F5B5B6',
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 md:py-14 flex flex-col justify-between min-h-[calc(100vh-100px)] animate-fade-in">
      {/* Editorial Header */}
      <div className="pb-8 sm:pb-12 border-b border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-medium text-[#CBD89E] tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5 text-[#CBD89E]" />
            Patterns & Synthesis
          </div>
          <span className="text-xs sm:text-sm text-white/60 font-light">
            Biometric & Reflective Synthesis · 30-Day Window
          </span>
        </div>

        <h1 className="text-white font-sans font-normal leading-[1.05] tracking-[-0.035em] text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] max-w-4xl text-balance">
          Emotional landscapes in gentle cadence.
        </h1>
        <p className="mt-4 sm:mt-5 text-white/80 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl text-balance">
          Observe the subtle ebbs, flows, and restorative currents that shape your wellbeing over time without the noise of dense analytics.
        </p>
      </div>

      {/* 4 Glassmorphic Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 my-8 sm:my-12">
        {insightCards.map((card, idx) => {
          const Icon = card.icon;
          const isNuanced = card.tone === 'nuanced';

          return (
            <div
              key={card.id}
              className={`glass-panel-interactive rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[290px] sm:min-h-[320px] relative overflow-hidden group delay-${(idx + 1) * 100}`}
            >
              <div
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 group-hover:opacity-40"
                style={{ backgroundColor: card.accentColor }}
              />

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium tracking-wide border border-white/15">
                    <Icon className="w-3.5 h-3.5 text-white/80" />
                    {card.category}
                  </span>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                    {card.trend === 'increase' && (
                      <TrendingUp className="w-3.5 h-3.5 text-[#CBD89E]" />
                    )}
                    {card.trend === 'decrease' && (
                      <TrendingDown className="w-3.5 h-3.5 text-[#F5B5B6]" />
                    )}
                    {card.trend === 'stable' && (
                      <Sparkles className="w-3.5 h-3.5 text-[#CBD89E]" />
                    )}
                    <span
                      className="text-xs sm:text-sm font-semibold tracking-tight"
                      style={{ color: card.accentColor }}
                    >
                      {card.metric}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-[-0.02em] leading-snug">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-white/75 font-light leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">
                    {card.statLabel}
                  </p>
                  <p
                    className="text-sm sm:text-base font-medium mt-0.5"
                    style={{ color: isNuanced ? '#FFE4E5' : '#E7F0C7' }}
                  >
                    {card.statValue}
                  </p>
                </div>

                <div className="w-24 sm:w-28 h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 group-hover:scale-x-105 origin-left"
                    style={{
                      width: isNuanced ? '45%' : '82%',
                      backgroundColor: card.accentColor,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refined CTA Area Near Bottom */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20 my-4 shadow-xl">
        <div className="max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs uppercase tracking-wider text-[#CBD89E] font-medium mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            Integrative Journal Synthesis
          </div>
          <h4 className="text-xl sm:text-2xl font-normal text-white tracking-tight">
            Ready to capture today's nuances?
          </h4>
          <p className="text-sm text-white/70 font-light mt-1">
            Every written thought recalibrates the resonance map, deepening emotional self-attunement.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <button
            type="button"
            onClick={onNavigateToJournal}
            className="px-6 py-3.5 rounded-full bg-white text-neutral-900 text-xs sm:text-sm font-medium tracking-wide shadow-lg hover:bg-neutral-100 transition-all duration-300 flex items-center gap-2 cursor-pointer group"
          >
            <span>Open Mood Journal</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            className="px-5 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs sm:text-sm text-white font-medium tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-white/80" />
            <span>Export Synthesis</span>
          </button>
        </div>
      </div>
    </section>
  );
}
