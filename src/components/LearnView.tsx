import React, { useState } from 'react';
import { ActiveTab, Language } from '../types';
import { getLearnUI, getLocalizedArticles } from '../utils/learnI18n';

interface LearnViewProps {
  language?: Language;
  setActiveTab: (tab: ActiveTab) => void;
}

type CategoryFilter = 'all' | 'models' | 'market' | 'bankroll';

export const LearnView: React.FC<LearnViewProps> = ({ language = 'bg', setActiveTab }) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('dixon-coles');

  // Interactive Live Sandbox State inside the Academy
  const [sandboxProb, setSandboxProb] = useState<number>(56);
  const [sandboxOdds, setSandboxOdds] = useState<number>(2.05);
  const [sandboxBankroll, setSandboxBankroll] = useState<number>(1000);

  const ui = getLearnUI(language);
  const articles = getLocalizedArticles(language);

  const filteredArticles =
    categoryFilter === 'all'
      ? articles
      : articles.filter((a) => a.category === categoryFilter);

  const activeArticle =
    articles.find((a) => a.id === selectedArticleId) || articles[0];

  // Live Sandbox Calculations
  const fairOdds = Number((100 / sandboxProb).toFixed(2));
  const evPercent = Number((((sandboxProb / 100) * sandboxOdds - 1) * 100).toFixed(2));
  const b = sandboxOdds - 1;
  const p = sandboxProb / 100;
  const q = 1 - p;
  const fullKellyPct = b > 0 ? Math.max(0, ((b * p - q) / b) * 100) : 0;
  const quarterKellyPct = Number(Math.min(5.0, fullKellyPct * 0.25).toFixed(2));
  const recommendedStakeEur = Number(((sandboxBankroll * quarterKellyPct) / 100).toFixed(2));

  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {/* =====================================================================
          1. CINEMATIC EDITORIAL HERO BANNER WITH STADIUM PHOTOGRAPHY
         ===================================================================== */}
      <section className="relative rounded-3xl overflow-hidden border border-[#1d2b40] bg-[#080d16] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0">
          <img
            src="/assets/academy/hero-stadium.jpg"
            alt="Oddspira Quantitative Football Academy Stadium"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060a11] via-[#070c15]/90 to-[#070c15]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b11] via-transparent to-[#070b11]/50" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/40 text-[#43f08a] text-xs font-mono font-bold uppercase tracking-wider">
              <span>{ui.badgeTop}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              {ui.heroTitlePrefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#43f08a] via-[#34d399] to-[#6ee7b7]">
                {ui.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#cbd5e1] leading-relaxed max-w-2xl">
              {ui.heroSubtitle}
            </p>

            {/* Quick Category Filter Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {[
                { id: 'all' as CategoryFilter, label: ui.catAll },
                { id: 'models' as CategoryFilter, label: ui.catModels },
                { id: 'market' as CategoryFilter, label: ui.catMarket },
                { id: 'bankroll' as CategoryFilter, label: ui.catBankroll },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#43f08a] text-[#05130b] shadow-[0_0_20px_rgba(67,240,138,0.4)]'
                      : 'bg-[#0d1522]/90 hover:bg-[#162236] text-[#cbd5e1] border border-[#24344d]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            {[
              { val: '6', label: ui.kpiGuides },
              { val: '14,200+', label: ui.kpiMatches },
              { val: '-0.11 ρ', label: ui.kpiRho },
              { val: '0.25x', label: ui.kpiKelly },
            ].map((stat, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-2xl bg-[#0a101b]/90 backdrop-blur-md border border-[#1e2d45] text-left"
              >
                <div className="text-lg sm:text-xl font-black font-mono text-[#43f08a]">
                  {stat.val}
                </div>
                <div className="text-[11px] text-[#94a3b8] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. VISUAL ARTICLE CARDS GRID (PHOTOGRAPHY + METADATA + SELECTOR)
         ===================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#43f08a]">
              {ui.curriculumTag}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {ui.curriculumTitle}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8f9cae]">
            {ui.curriculumHint}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => {
            const isSelected = art.id === activeArticle.id;
            return (
              <div
                key={art.id}
                onClick={() => {
                  setSelectedArticleId(art.id);
                  const readerEl = document.getElementById('oddspira-article-reader');
                  if (readerEl) {
                    readerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`group rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0f1726] border-[#43f08a] shadow-[0_0_30px_rgba(67,240,138,0.2)]'
                    : 'bg-[#0b101b] border-[#1b263b] hover:border-[#43f08a]/50 hover:bg-[#0e1524]'
                }`}
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-[#060911]">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b101b] via-[#0b101b]/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#070b11]/90 border border-[#43f08a]/40 text-[#43f08a] font-mono font-black text-xs">
                        #{art.number}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#070b11]/90 border border-[#1e2d42] text-[#e2e8f0] font-mono text-[10px] font-bold">
                        {art.categoryLabel}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#cbd5e1]">
                      <span className="px-2 py-0.5 rounded bg-[#10b981]/20 border border-[#10b981]/40 text-[#43f08a] font-bold">
                        {art.badge}
                      </span>
                      <span>⏱ {art.readTime}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#43f08a] transition-colors leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#94a3b8] line-clamp-3 leading-relaxed">
                      {art.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-2 border-t border-[#162032] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748b]">{art.level}</span>
                  <span
                    className={`font-bold ${
                      isSelected ? 'text-[#43f08a]' : 'text-[#cbd5e1] group-hover:text-[#43f08a]'
                    }`}
                  >
                    {isSelected ? ui.readingNow : ui.readArticle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          3. FULL ILLUSTRATED MASTERCLASS READER + CUSTOM VISUAL DIAGRAMS
         ===================================================================== */}
      <section
        id="oddspira-article-reader"
        className="rounded-3xl border border-[#1f2e47] bg-[#0b101b] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
      >
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#060a12]">
          <img
            src={activeArticle.image}
            alt={activeArticle.title}
            className="w-full h-full object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b101b] via-[#0b101b]/65 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-10 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-lg bg-[#43f08a] text-[#04130a] font-black">
                {ui.masterclassPrefix} #{activeArticle.number}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#0d1626]/90 border border-[#263854] text-[#43f08a] font-bold">
                {activeArticle.badge}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#0d1626]/90 border border-[#263854] text-[#cbd5e1]">
                ⏱ {activeArticle.readTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight max-w-4xl">
              {activeArticle.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-3xl leading-relaxed">
              {activeArticle.subtitle}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-7">
            <div className="p-5 rounded-2xl bg-[#0f1726] border-l-4 border-[#43f08a] text-sm sm:text-base text-[#e2e8f0] leading-relaxed font-medium">
              {activeArticle.leadParagraph}
            </div>

            {activeArticle.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] font-mono text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-sm sm:text-[15px] text-[#cbd5e1] leading-relaxed">
                  {sec.body}
                </p>
                {sec.bullets && (
                  <ul className="space-y-2 pt-1">
                    {sec.bullets.map((bText, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-[#cbd5e1] bg-[#080d16] p-3 rounded-xl border border-[#182336]"
                      >
                        <span className="text-[#43f08a] font-bold mt-0.5">✔</span>
                        <span>{bText}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Dynamic Custom Infographic / Tactical Diagram */}
            <div className="rounded-2xl bg-[#070b12] border border-[#1d2b42] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#162133] pb-3">
                <span className="text-xs font-mono font-bold text-[#43f08a] uppercase">
                  {ui.visualSchemeTitle}
                </span>
                <span className="text-[11px] font-mono text-[#8f9cae]">
                  ODDSPIRA VISUAL LAB
                </span>
              </div>

              {activeArticle.id === 'synthetic-xg' ? (
                <div className="space-y-3">
                  <svg
                    viewBox="0 0 600 300"
                    className="w-full h-auto rounded-xl bg-[#06140e] border border-[#10b981]/30"
                  >
                    <rect x="0" y="0" width="600" height="300" fill="#06150f" />
                    <rect x="50" y="10" width="500" height="280" fill="none" stroke="#1e3a2f" strokeWidth="2" />
                    <rect x="130" y="10" width="340" height="165" fill="#0a291c" fillOpacity="0.45" stroke="#34d399" strokeWidth="2" />
                    <rect x="220" y="10" width="160" height="60" fill="#10b981" fillOpacity="0.35" stroke="#43f08a" strokeWidth="2" />
                    <rect x="260" y="2" width="80" height="8" fill="#43f08a" />

                    <circle cx="300" cy="42" r="22" fill="#43f08a" fillOpacity="0.85" />
                    <text x="300" y="46" textAnchor="middle" fill="#04130a" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      0.44 xG
                    </text>

                    <circle cx="300" cy="115" r="28" fill="#10b981" fillOpacity="0.65" stroke="#43f08a" strokeWidth="1.5" />
                    <text x="300" y="113" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      0.18 xG
                    </text>
                    <text x="300" y="126" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontFamily="monospace">
                      {ui.penaltyLabel}
                    </text>

                    <circle cx="185" cy="95" r="22" fill="#0ea5e9" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="185" y="99" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      0.07 xG
                    </text>

                    <circle cx="415" cy="95" r="22" fill="#0ea5e9" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="415" y="99" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      0.07 xG
                    </text>

                    <circle cx="300" cy="225" r="24" fill="#64748b" fillOpacity="0.35" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
                    <text x="300" y="229" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      0.025 xG
                    </text>

                    <text x="20" y="280" fill="#43f08a" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      {ui.xgPitchMapLabel}
                    </text>
                  </svg>
                </div>
              ) : activeArticle.id === 'dixon-coles' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  {[
                    { score: `${ui.scoreLabel} 0 : 0`, poisson: '8.2%', dc: '9.4%', delta: ui.moreDraws, positive: true },
                    { score: `${ui.scoreLabel} 1 : 0`, poisson: '14.6%', dc: '13.4%', delta: ui.downwardAdj, positive: false },
                    { score: `${ui.scoreLabel} 0 : 1`, poisson: '10.1%', dc: '9.1%', delta: ui.downwardAdj, positive: false },
                    { score: `${ui.scoreLabel} 1 : 1`, poisson: '11.4%', dc: '12.7%', delta: ui.keyEvPeak, positive: true },
                  ].map((cell, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#0c1322] border border-[#1d2b44] space-y-1.5">
                      <div className="text-[11px] font-bold text-white">{cell.score}</div>
                      <div className="text-[11px] text-[#8f9cae]">{ui.purePoissonLabel}: {cell.poisson}</div>
                      <div className="text-sm font-black text-[#43f08a]">Dixon-Coles: {cell.dc}</div>
                      <div className={`text-[10px] ${cell.positive ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {cell.delta}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {[
                    {
                      label: ui.sharpBenchmarkLabel,
                      pct: 92,
                      tag: ui.sharpBenchmarkTag,
                      color: 'bg-[#43f08a]',
                    },
                    {
                      label: ui.kellyPortfolioLabel,
                      pct: 84,
                      tag: ui.kellyPortfolioTag,
                      color: 'bg-emerald-500',
                    },
                    {
                      label: ui.softBookieLabel,
                      pct: 48,
                      tag: ui.softBookieTag,
                      color: 'bg-amber-500',
                    },
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white font-bold">{bar.label}</span>
                        <span className="text-[#43f08a]">{bar.tag}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#111a2b] overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mathematical Formula Code Box */}
            <div className="rounded-2xl bg-[#06090f] border border-[#43f08a]/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#43f08a] uppercase">
                  ∑ {activeArticle.formulaTitle}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#43f08a]/10 text-[#43f08a] text-[10px] font-mono">
                  {ui.verifiedFormula}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#090e17] border border-[#162133] font-mono text-xs sm:text-[13px] text-[#e2e8f0] space-y-1.5 overflow-x-auto">
                {activeArticle.formulaLines.map((line, lIdx) => (
                  <div
                    key={lIdx}
                    className={
                      line.startsWith('──')
                        ? 'text-[#1e2d45] select-none'
                        : line.includes('=')
                        ? 'text-[#43f08a] font-bold'
                        : 'text-[#cbd5e1]'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#94a3b8] italic">{activeArticle.formulaNote}</p>
            </div>
          </div>

          {/* Right 4 Columns: Real Match Case Study + Key Takeaways + CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-gradient-to-b from-[#0e1928] to-[#0a111c] border border-[#243854] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] font-mono text-[10px] font-bold uppercase">
                  {ui.caseStudyBadge}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-white">
                  {activeArticle.caseStudy.match}
                </h4>
                <span className="text-xs font-mono text-[#8f9cae]">
                  {activeArticle.caseStudy.competition}
                </span>
              </div>

              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {activeArticle.caseStudy.scenario}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {activeArticle.caseStudy.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className={`p-3 rounded-xl border ${
                      m.highlight
                        ? 'bg-[#092216] border-[#43f08a]/50 text-[#43f08a]'
                        : 'bg-[#080d16] border-[#192538] text-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-[#94a3b8]">{m.label}</div>
                    <div className="text-xs sm:text-sm font-mono font-black mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#070b12] border border-[#1c2b42] text-xs text-[#e2e8f0] leading-relaxed">
                <strong className="text-[#43f08a] block font-mono uppercase text-[10px] mb-1">
                  {ui.verdictTitle}
                </strong>
                {activeArticle.caseStudy.verdict}
              </div>
            </div>

            <div className="rounded-2xl bg-[#0e1524] border border-[#1d2b42] p-5 space-y-3.5">
              <h4 className="text-sm font-mono font-bold uppercase text-white">
                {ui.goldenRulesTitle}
              </h4>
              <ul className="space-y-2.5">
                {activeArticle.keyTakeaways.map((item, kIdx) => (
                  <li key={kIdx} className="flex items-start gap-2.5 text-xs text-[#cbd5e1] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#43f08a]/20 text-[#43f08a] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {kIdx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(activeArticle.ctaTarget);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#43f08a] to-[#2cd873] hover:from-[#56f498] hover:to-[#38e07e] text-[#04130a] font-mono font-black text-xs uppercase tracking-wide cursor-pointer shadow-[0_0_25px_rgba(67,240,138,0.3)] transition-all"
                >
                  {activeArticle.ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. INTERACTIVE LIVE MINI-LAB ("LIVE QUANT SANDBOX")
         ===================================================================== */}
      <section className="rounded-3xl border border-[#43f08a]/40 bg-gradient-to-r from-[#09131c] via-[#0b1520] to-[#091815] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1c2d42] pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#43f08a]">
              {ui.sandboxTag}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {ui.sandboxTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className="px-4 py-2 rounded-xl bg-[#111c2d] hover:bg-[#192840] border border-[#293d5c] text-xs font-mono font-bold text-[#43f08a] cursor-pointer self-start md:self-auto"
          >
            {ui.openFullCalculators}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4 bg-[#070b12] p-5 rounded-2xl border border-[#19263b]">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#cbd5e1]">{ui.sliderProb}</span>
                <strong className="text-[#43f08a]">
                  {sandboxProb}% ({ui.fairOddsShort}: {fairOdds})
                </strong>
              </div>
              <input
                type="range"
                min={20}
                max={85}
                step={1}
                value={sandboxProb}
                onChange={(e) => setSandboxProb(Number(e.target.value))}
                className="w-full accent-[#43f08a] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#cbd5e1]">{ui.sliderOdds}</span>
                <strong className="text-white">{sandboxOdds.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min={1.25}
                max={4.5}
                step={0.05}
                value={sandboxOdds}
                onChange={(e) => setSandboxOdds(Number(e.target.value))}
                className="w-full accent-[#43f08a] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#cbd5e1]">{ui.sliderBankroll}</span>
                <strong className="text-white">{sandboxBankroll} €</strong>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={sandboxBankroll}
                onChange={(e) => setSandboxBankroll(Number(e.target.value))}
                className="w-full accent-[#43f08a] cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-[#070b12] border border-[#19263b]">
              <div className="text-[10px] text-[#8f9cae]">{ui.cardFairOdds}</div>
              <div className="text-2xl font-black text-white mt-1">{fairOdds}</div>
              <div className="text-[10px] text-[#64748b] mt-1">100 / {sandboxProb}%</div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                evPercent > 0
                  ? 'bg-[#082416] border-[#43f08a]'
                  : 'bg-red-950/30 border-red-500/40'
              }`}
            >
              <div className="text-[10px] text-[#cbd5e1]">{ui.cardEv}</div>
              <div
                className={`text-2xl font-black mt-1 ${
                  evPercent > 0 ? 'text-[#43f08a]' : 'text-red-400'
                }`}
              >
                {evPercent > 0 ? `+${evPercent}%` : `${evPercent}%`}
              </div>
              <div className="text-[10px] text-[#cbd5e1] mt-1">
                {evPercent > 0 ? ui.evPositive : ui.evNegative}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070b12] border border-[#19263b]">
              <div className="text-[10px] text-[#8f9cae]">{ui.cardQuarterKelly}</div>
              <div className="text-xl font-black text-[#43f08a] mt-1">{quarterKellyPct}%</div>
              <div className="text-[10px] text-[#64748b] mt-1">{ui.safetyCap}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070b12] border border-[#19263b]">
              <div className="text-[10px] text-[#8f9cae]">{ui.cardRecommendedStake}</div>
              <div className="text-xl font-black text-white mt-1">{recommendedStakeEur} €</div>
              <div className="text-[10px] text-[#64748b] mt-1">
                {ui.fromBankroll} {sandboxBankroll} €
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. QUANT GLOSSARY
         ===================================================================== */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#43f08a]">
            {ui.glossaryTag}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {ui.glossaryTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ui.glossary.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#0b101b] border border-[#1a263b] hover:border-[#43f08a]/40 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-black text-[#43f08a]">{item.term}</span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded bg-[#111b2c] text-[10px] font-mono text-[#93c5fd]">
                {item.tag}
              </span>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
