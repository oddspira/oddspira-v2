import { ActiveTab, Language } from '../types';
import { HeroLeftSection, heroTranslations } from './HeroLeftSection';

interface HeroProps {
  language: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArchitecture?: () => void;
}

export function Hero({ language, setActiveTab }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800/80 bg-[#07090e] py-8 lg:py-10">
      {/* Background isometric grid texture and emerald ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 28px 28px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Expanded Container (max-w-[1440px]) to give full presence to the 3D Workstation and Left Section */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge */}
        <div className="mb-3.5 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-xs font-mono font-bold tracking-wider text-[#10b981] uppercase w-fit select-none">
            <span aria-hidden="true" className="text-sm">
              ⚙
            </span>
            <span>{heroTranslations[language as keyof typeof heroTranslations]?.badge || heroTranslations.bg.badge}</span>
          </div>
        </div>

        {/* 2-Column Grid: Perfectly Aligned Left Text Section & Right 3D Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch">
          {/* Left Column: Quantitative Thesis, 3 Single-Row Action CTAs & Indicators (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between h-full min-h-[250px] lg:min-h-[255px]">
            <HeroLeftSection
              language={language}
              showBadge={false}
              className="h-full"
              onFindMatches={() => setActiveTab('live')}
              onLaunchSimulator={() => setActiveTab('analysis')}
              onHowItWorks={() => setActiveTab('learn')}
            />
          </div>

          {/* Right Column: Hero 3D Oddspira Workstation (5 cols - Exactly aligned top to H1, bottom to Indicators, Identical across all languages) */}
          <div className="lg:col-span-5 xl:col-span-5 relative w-full h-full min-h-[250px] lg:min-h-[255px] flex flex-col">
            {/* Deep Volumetric Ambient Emerald Halo - Subtle & Static */}
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-[#43f08a]/15 to-teal-400/10 blur-2xl opacity-60"
              aria-hidden="true"
            />

            {/* 3D Tablet Workstation Showcase - Perfect Top, Bottom & Edge Alignment */}
            <div className="relative w-full h-full min-h-[250px] lg:min-h-[255px] rounded-2xl border border-emerald-500/25 bg-[#070b11] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(16,185,129,0.15)] overflow-hidden cursor-default select-none pointer-events-none flex items-center justify-center">
              {/* High-Definition 3D Analytics Tablet Image */}
              <img
                src="/assets/aistudio/image_ad44ddcf.png"
                alt="Oddspira Quantitative Sports Analytics Tablet Workstation"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center rounded-2xl block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/oddspira_hero_workstation.png';
                }}
              />

              {/* Specular Hairline Inner Rim - completely static */}
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
