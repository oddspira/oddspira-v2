import React, { useMemo, useState } from 'react';
import { Language } from '../types';
import { getToolsUI } from '../utils/toolsI18n';
import { computePoissonMatrix } from '../utils/mathModels';

interface CalculatorsHubProps {
  language?: Language;
}

type ToolTab = 'ev' | 'poisson' | 'novig' | 'kelly' | 'dutching';

interface MatchPreset {
  id: string;
  label: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeXg: number;
  awayXg: number;
  odds1: number;
  oddsX: number;
  odds2: number;
  evProb: number;
  evOdds: number;
  closingFair: number;
}

const MATCH_PRESETS: MatchPreset[] = [
  {
    id: 'rma-mci',
    label: 'Real Madrid vs Man City',
    homeTeam: 'Real Madrid',
    awayTeam: 'Man City',
    league: 'UEFA Champions League',
    homeXg: 1.72,
    awayXg: 1.58,
    odds1: 2.38,
    oddsX: 3.55,
    odds2: 2.85,
    evProb: 46.5,
    evOdds: 2.38,
    closingFair: 2.15,
  },
  {
    id: 'ars-bay',
    label: 'Arsenal vs Bayern Munich',
    homeTeam: 'Arsenal',
    awayTeam: 'Bayern Munich',
    league: 'UEFA Champions League',
    homeXg: 1.84,
    awayXg: 1.18,
    odds1: 1.92,
    oddsX: 3.65,
    odds2: 3.9,
    evProb: 56.0,
    evOdds: 1.92,
    closingFair: 1.79,
  },
  {
    id: 'int-atm',
    label: 'Inter Milan vs Atletico',
    homeTeam: 'Inter Milan',
    awayTeam: 'Atletico',
    league: 'Tactical Low-Tempo Clash',
    homeXg: 1.38,
    awayXg: 0.88,
    odds1: 1.85,
    oddsX: 3.4,
    odds2: 4.6,
    evProb: 61.0,
    evOdds: 1.8,
    closingFair: 1.64,
  },
  {
    id: 'liv-tot',
    label: 'Liverpool vs Tottenham',
    homeTeam: 'Liverpool',
    awayTeam: 'Tottenham',
    league: 'Premier League High-xG',
    homeXg: 2.35,
    awayXg: 1.42,
    odds1: 1.55,
    oddsX: 4.5,
    odds2: 5.25,
    evProb: 68.0,
    evOdds: 1.58,
    closingFair: 1.47,
  },
];

function computeKellyDetails(odds: number, probPct: number, bankroll: number, fraction: number) {
  const b = odds - 1;
  const p = probPct / 100;
  const q = 1 - p;
  const fullKelly = b > 0 ? Math.max(0, (b * p - q) / b) : 0;
  const fracPct = Number(Math.min(15, fullKelly * fraction * 100).toFixed(2));
  const stake = Number(((bankroll * fracPct) / 100).toFixed(2));
  return {
    fractionalKellyPercentage: fracPct,
    recommendedStake: stake,
  };
}

export const CalculatorsHub: React.FC<CalculatorsHubProps> = ({ language = 'bg' }) => {
  const ui = getToolsUI(language);
  const [activeTool, setActiveTool] = useState<ToolTab>('ev');
  const [activePresetId, setActivePresetId] = useState<string>('ars-bay');

  // Tool 1: +EV & CLV State
  const [evOdds, setEvOdds] = useState<number>(1.92);
  const [evTrueProb, setEvTrueProb] = useState<number>(56.0);
  const [closingFairOdds, setClosingFairOdds] = useState<number>(1.79);
  const [evStake, setEvStake] = useState<number>(100);

  // Tool 2: 6x6 Poisson & Dixon-Coles State
  const [homeXg, setHomeXg] = useState<number>(1.84);
  const [awayXg, setAwayXg] = useState<number>(1.18);
  const [useDixonColes, setUseDixonColes] = useState<boolean>(true);
  const [mkt1, setMkt1] = useState<number>(1.92);
  const [mktX, setMktX] = useState<number>(3.65);
  const [mkt2, setMkt2] = useState<number>(3.9);

  // Tool 3: No-Vig Scanner State
  const [noVigMode, setNoVigMode] = useState<'3way' | '2way'>('3way');
  const [nvOdds1, setNvOdds1] = useState<number>(1.92);
  const [nvOddsX, setNvOddsX] = useState<number>(3.65);
  const [nvOdds2, setNvOdds2] = useState<number>(3.9);

  // Tool 4: Kelly Criterion State
  const [kellyBankroll, setKellyBankroll] = useState<number>(2000);
  const [kellyFraction, setKellyFraction] = useState<number>(0.25);

  // Tool 5: Dutching & Arbitrage Splitter State
  const [dutchBudget, setDutchBudget] = useState<number>(100);
  const [dutchSelections, setDutchSelections] = useState<{ label: string; odds: number }[]>([
    { label: '1:0 / Selection A', odds: 6.5 },
    { label: '2:0 / Selection B', odds: 7.5 },
    { label: '2:1 / Selection C', odds: 8.5 },
  ]);

  const activePreset =
    MATCH_PRESETS.find((p) => p.id === activePresetId) || MATCH_PRESETS[1];

  const applyPreset = (preset: MatchPreset) => {
    setActivePresetId(preset.id);
    setEvOdds(preset.evOdds);
    setEvTrueProb(preset.evProb);
    setClosingFairOdds(preset.closingFair);
    setHomeXg(preset.homeXg);
    setAwayXg(preset.awayXg);
    setMkt1(preset.odds1);
    setMktX(preset.oddsX);
    setMkt2(preset.odds2);
    setNvOdds1(preset.odds1);
    setNvOddsX(preset.oddsX);
    setNvOdds2(preset.odds2);
  };

  // Calculations for Tool 1 (+EV & CLV)
  const evResult = useMemo(() => {
    const p = evTrueProb / 100;
    const evPct = Number(((p * evOdds - 1) * 100).toFixed(2));
    const expectedProfit = Number(((evStake * evPct) / 100).toFixed(2));
    const impliedProbability = evOdds > 0 ? Number(((1 / evOdds) * 100).toFixed(1)) : 0;
    return {
      evPercentage: evPct,
      expectedProfit,
      impliedProbability,
      isPositiveEV: evPct > 0,
    };
  }, [evOdds, evTrueProb, evStake]);

  const fairModelOdds = useMemo(
    () => (evTrueProb > 0 ? Number((100 / evTrueProb).toFixed(2)) : 0),
    [evTrueProb]
  );
  const clvPercent = useMemo(
    () =>
      closingFairOdds > 1
        ? Number(((evOdds / closingFairOdds - 1) * 100).toFixed(2))
        : 0,
    [evOdds, closingFairOdds]
  );

  // Needle angle for EV Radial Speedometer (-90 deg to +90 deg)
  const evNeedleAngle = useMemo(() => {
    const clamped = Math.max(-20, Math.min(25, evResult.evPercentage));
    // Map [-20, 25] -> [-90, 90]
    return ((clamped + 20) / 45) * 180 - 90;
  }, [evResult.evPercentage]);

  // Calculations for Tool 2 (6x6 Poisson & Dixon-Coles)
  const poissonRaw = useMemo(
    () => computePoissonMatrix(homeXg, awayXg, useDixonColes),
    [homeXg, awayXg, useDixonColes]
  );

  const poissonResult = useMemo(
    () => ({
      matrix: poissonRaw.matrix,
      homeWin: Number((poissonRaw.homeWinProb * 100).toFixed(1)),
      draw: Number((poissonRaw.drawProb * 100).toFixed(1)),
      awayWin: Number((poissonRaw.awayWinProb * 100).toFixed(1)),
      over25: Number((poissonRaw.over25Prob * 100).toFixed(1)),
      btts: Number((poissonRaw.bttsProb * 100).toFixed(1)),
    }),
    [poissonRaw]
  );

  const topScorelines = useMemo(() => {
    const list: { score: string; prob: number; fairOdds: number }[] = [];
    poissonResult.matrix.forEach((row, h) => {
      row.forEach((prob, a) => {
        list.push({
          score: `${h} : ${a}`,
          prob: Number((prob * 100).toFixed(2)),
          fairOdds: prob > 0 ? Number((1 / prob).toFixed(2)) : 99,
        });
      });
    });
    return list.sort((a, b) => b.prob - a.prob).slice(0, 5);
  }, [poissonResult]);

  // Calculations for Tool 3 (No-Vig)
  const noVig3Result = useMemo(() => {
    const inv1 = 1 / nvOdds1;
    const invX = 1 / nvOddsX;
    const inv2 = 1 / nvOdds2;
    const sum = inv1 + invX + inv2;
    const margin = Number(((sum - 1) * 100).toFixed(2));
    const p1 = inv1 / sum;
    const pX = invX / sum;
    const p2 = inv2 / sum;
    return {
      margin,
      fairHomeOdds: Number((1 / p1).toFixed(2)),
      fairDrawOdds: Number((1 / pX).toFixed(2)),
      fairAwayOdds: Number((1 / p2).toFixed(2)),
      trueHomeProb: Number((p1 * 100).toFixed(1)),
      trueDrawProb: Number((pX * 100).toFixed(1)),
      trueAwayProb: Number((p2 * 100).toFixed(1)),
    };
  }, [nvOdds1, nvOddsX, nvOdds2]);

  const noVig2Result = useMemo(() => {
    const invA = 1 / nvOdds1;
    const invB = 1 / nvOdds2;
    const sum = invA + invB;
    const margin = Number(((sum - 1) * 100).toFixed(2));
    const pA = invA / sum;
    const pB = invB / sum;
    return {
      margin,
      fairOddsA: Number((1 / pA).toFixed(2)),
      fairOddsB: Number((1 / pB).toFixed(2)),
      trueProbA: Number((pA * 100).toFixed(1)),
      trueProbB: Number((pB * 100).toFixed(1)),
    };
  }, [nvOdds1, nvOdds2]);

  // Calculations for Tool 4 (Kelly + Live Monte Carlo Equity Fan Curves)
  const kellyQuarter = useMemo(
    () => computeKellyDetails(evOdds, evTrueProb, kellyBankroll, 0.25),
    [evOdds, evTrueProb, kellyBankroll]
  );
  const kellyHalf = useMemo(
    () => computeKellyDetails(evOdds, evTrueProb, kellyBankroll, 0.5),
    [evOdds, evTrueProb, kellyBankroll]
  );
  const kellyFull = useMemo(
    () => computeKellyDetails(evOdds, evTrueProb, kellyBankroll, 1.0),
    [evOdds, evTrueProb, kellyBankroll]
  );
  const activeKelly = useMemo(
    () => computeKellyDetails(evOdds, evTrueProb, kellyBankroll, kellyFraction),
    [evOdds, evTrueProb, kellyBankroll, kellyFraction]
  );

  // Generate SVG path coordinates for Kelly Equity Growth Fan (50 Bets)
  const kellyFanPaths = useMemo(() => {
    const steps = 25;
    const b = Math.max(0.1, evOdds - 1);
    const p = evTrueProb / 100;
    const q = 1 - p;
    const f = activeKelly.fractionalKellyPercentage / 100;
    // Expected log growth rate per bet: g = p * ln(1 + f*b) + q * ln(1 - f)
    const g =
      f > 0 && f < 0.95
        ? p * Math.log(1 + f * b) + q * Math.log(Math.max(0.05, 1 - f))
        : 0;
    const sigma = f * Math.sqrt(p * q) * (b + 1);

    const bullPoints: string[] = [];
    const medianPoints: string[] = [];
    const bearPoints: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 50; // up to 50 bets
      const x = 30 + (i / steps) * 440;
      const medMult = Math.exp(g * t);
      const bullMult = Math.exp(g * t + 1.15 * sigma * Math.sqrt(t));
      const bearMult = Math.exp(g * t - 1.15 * sigma * Math.sqrt(t));

      // Map multiplier [0.3 .. 2.8] to y [165 .. 15]
      const mapY = (m: number) => {
        const clamped = Math.max(0.25, Math.min(3.0, m));
        return Number((165 - ((clamped - 0.25) / 2.75) * 145).toFixed(1));
      };

      bullPoints.push(`${x.toFixed(1)},${mapY(bullMult)}`);
      medianPoints.push(`${x.toFixed(1)},${mapY(medMult)}`);
      bearPoints.push(`${x.toFixed(1)},${mapY(bearMult)}`);
    }

    const areaPolygon = [...bullPoints, ...bearPoints.slice().reverse()].join(' ');
    return {
      bullLine: `M ${bullPoints.join(' L ')}`,
      medianLine: `M ${medianPoints.join(' L ')}`,
      bearLine: `M ${bearPoints.join(' L ')}`,
      areaPolygon,
      baselineY: Number((165 - ((1.0 - 0.25) / 2.75) * 145).toFixed(1)),
      projectedMedianEur: Math.round(kellyBankroll * Math.exp(g * 50)),
      projectedBullEur: Math.round(
        kellyBankroll * Math.exp(g * 50 + 1.15 * sigma * Math.sqrt(50))
      ),
    };
  }, [evOdds, evTrueProb, activeKelly.fractionalKellyPercentage, kellyBankroll]);

  // Calculations for Tool 5 (Dutching)
  const dutchResult = useMemo(() => {
    const valid = dutchSelections.filter((s) => s.odds > 1.01);
    const sumImplied = valid.reduce((acc, s) => acc + 1 / s.odds, 0);
    const palette = ['#43f08a', '#38bdf8', '#f59e0b', '#c084fc'];
    const rows = valid.map((s, idx) => {
      const weight = 1 / s.odds / (sumImplied || 1);
      const stake = Number((dutchBudget * weight).toFixed(2));
      const totalReturn = Number((stake * s.odds).toFixed(2));
      const sharePct = Number((weight * 100).toFixed(1));
      return {
        ...s,
        stake,
        totalReturn,
        sharePct,
        color: palette[idx % palette.length],
      };
    });
    const avgReturn = rows.length > 0 ? rows[0].totalReturn : 0;
    const netProfit = Number((avgReturn - dutchBudget).toFixed(2));
    const roiPct =
      dutchBudget > 0 ? Number(((netProfit / dutchBudget) * 100).toFixed(2)) : 0;
    return {
      sumImpliedPct: Number((sumImplied * 100).toFixed(2)),
      rows,
      netProfit,
      roiPct,
      avgReturn,
    };
  }, [dutchBudget, dutchSelections]);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* =====================================================================
          1. CINEMATIC QUANT LAB HERO BANNER + LIVE MATCH PRESETS
         ===================================================================== */}
      <section className="relative rounded-3xl overflow-hidden border border-[#1d2b40] bg-[#080d16] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0">
          <img
            src="/assets/academy/quant-terminal.jpg"
            alt="Oddspira Quantitative Calculators Terminal"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060a11] via-[#070c15]/92 to-[#070c15]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b11] via-transparent to-[#070b11]/50" />
        </div>

        {/* Decorative Glowing Grid Accent */}
        <div className="relative z-10 p-6 sm:p-10 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/40 text-[#43f08a] text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-pulse" />
                <span>{ui.badgeTop}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                {ui.heroTitlePrefix}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#43f08a] via-[#34d399] to-[#38bdf8]">
                  {ui.heroTitleHighlight}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#cbd5e1] leading-relaxed max-w-2xl">
                {ui.heroSubtitle}
              </p>
            </div>

            {/* Right Creative Mini-Telemetry Radar Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
              {[
                { val: '5', label: ui.kpiTools, icon: '⚡' },
                { val: '36 (6x6)', label: ui.kpiMatrix, icon: '🎯' },
                { val: '0.0% Vig', label: ui.kpiPrecision, icon: '⚖️' },
                { val: '0.25x', label: ui.kpiSafety, icon: '🛡️' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="px-4 py-3 rounded-2xl bg-[#0a101b]/90 backdrop-blur-md border border-[#1e2d45] hover:border-[#43f08a]/50 transition-all text-left flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#43f08a]/10 border border-[#43f08a]/30 flex items-center justify-center text-base shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black font-mono text-[#43f08a]">
                      {stat.val}
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Live Match Scenario Presets Bar */}
          <div className="pt-4 border-t border-[#1b2940]/80 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[#43f08a] mr-1">
              {ui.presetsLabel}
            </span>
            {MATCH_PRESETS.map((preset) => {
              const isSelected = preset.id === activePresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#43f08a] text-[#04130a] font-black shadow-[0_0_20px_rgba(67,240,138,0.35)] scale-[1.02]'
                      : 'bg-[#0c1422]/90 hover:bg-[#152238] text-[#e2e8f0] border border-[#243650]'
                  }`}
                >
                  <span>⚽ {preset.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#04130a]/20 text-[#04130a]'
                        : 'bg-[#162338] text-[#43f08a]'
                    }`}
                  >
                    {preset.homeXg} - {preset.awayXg} xG
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. CREATIVE VISUAL 5-TOOL NAVIGATION CARDS WITH MINI SVG GRAPHICS
         ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          {
            id: 'ev' as ToolTab,
            label: ui.tabEv,
            sub: '+EV% · CLV% · Speedometer',
            badge: `${evResult.evPercentage > 0 ? '+' : ''}${evResult.evPercentage}% EV`,
            visual: (
              <svg viewBox="0 0 80 42" className="w-16 h-9 shrink-0">
                <path
                  d="M 8 36 A 28 28 0 0 1 72 36"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 8 36 A 28 28 0 0 1 64 16"
                  fill="none"
                  stroke="#43f08a"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="36" r="4" fill="#43f08a" />
                <line
                  x1="40"
                  y1="36"
                  x2="56"
                  y2="16"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
          {
            id: 'poisson' as ToolTab,
            label: ui.tabPoisson,
            sub: 'Tactical Pitch · 6x6 Matrix',
            badge: `${homeXg.toFixed(1)} vs ${awayXg.toFixed(1)} xG`,
            visual: (
              <svg viewBox="0 0 80 42" className="w-16 h-9 shrink-0 rounded bg-[#071f14] border border-[#10b981]/30">
                <rect x="4" y="4" width="72" height="34" fill="none" stroke="#10b981" strokeWidth="1.2" opacity="0.6" />
                <line x1="40" y1="4" x2="40" y2="38" stroke="#10b981" strokeWidth="1.2" opacity="0.6" />
                <circle cx="40" cy="21" r="7" fill="none" stroke="#10b981" strokeWidth="1.2" opacity="0.6" />
                <circle cx="22" cy="21" r="6" fill="#43f08a" opacity="0.75" />
                <circle cx="58" cy="21" r="4.5" fill="#38bdf8" opacity="0.75" />
              </svg>
            ),
          },
          {
            id: 'novig' as ToolTab,
            label: ui.tabNoVig,
            sub: 'Donut X-Ray · Fair Odds',
            badge: `${noVigMode === '3way' ? noVig3Result.margin : noVig2Result.margin}% Vig`,
            visual: (
              <svg viewBox="0 0 80 42" className="w-16 h-9 shrink-0">
                <circle cx="40" cy="21" r="15" fill="none" stroke="#1e293b" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="21"
                  r="15"
                  fill="none"
                  stroke="#43f08a"
                  strokeWidth="6"
                  strokeDasharray="72 25"
                />
                <circle
                  cx="40"
                  cy="21"
                  r="15"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeDasharray="18 80"
                  strokeDashoffset="-72"
                />
              </svg>
            ),
          },
          {
            id: 'kelly' as ToolTab,
            label: ui.tabKelly,
            sub: 'Monte Carlo Fan · Risk',
            badge: `${activeKelly.recommendedStake}€ Stake`,
            visual: (
              <svg viewBox="0 0 80 42" className="w-16 h-9 shrink-0">
                <polygon points="6,34 30,22 55,14 74,6 74,34 55,31 30,33" fill="#43f08a" opacity="0.2" />
                <polyline
                  points="6,34 28,25 52,17 74,8"
                  fill="none"
                  stroke="#43f08a"
                  strokeWidth="2.5"
                />
                <polyline
                  points="6,34 28,30 52,26 74,22"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="3 2"
                />
              </svg>
            ),
          },
          {
            id: 'dutching' as ToolTab,
            label: ui.tabDutching,
            sub: 'Capital Wheel · Equal Towers',
            badge: `${dutchResult.roiPct > 0 ? '+' : ''}${dutchResult.roiPct}% ROI`,
            visual: (
              <svg viewBox="0 0 80 42" className="w-16 h-9 shrink-0">
                <rect x="14" y="14" width="12" height="24" rx="2" fill="#43f08a" />
                <rect x="34" y="14" width="12" height="24" rx="2" fill="#38bdf8" />
                <rect x="54" y="14" width="12" height="24" rx="2" fill="#f59e0b" />
                <line x1="8" y1="14" x2="72" y2="14" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            ),
          },
        ].map((t) => {
          const active = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                active
                  ? 'bg-gradient-to-b from-[#11261f] via-[#0c1a18] to-[#091219] border-[#43f08a] shadow-[0_0_30px_rgba(67,240,138,0.22)] -translate-y-0.5'
                  : 'bg-[#0b101b] border-[#1b263b] hover:border-[#43f08a]/50 hover:bg-[#0f1726]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`text-xs sm:text-sm font-black font-mono leading-tight ${
                      active ? 'text-[#43f08a]' : 'text-white'
                    }`}
                  >
                    {t.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#8f9cae] mt-1">{t.sub}</div>
                </div>
                {t.visual}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#182438]/80 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#070b12] text-[#43f08a] font-bold border border-[#1e2f47]">
                  {t.badge}
                </span>
                <span className={active ? 'text-[#43f08a] font-bold' : 'text-[#64748b]'}>
                  {active ? '● ACTIVE' : 'OPEN →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TOOL 1: EXPECTED VALUE (+EV) & CLV AUDITOR + RADIAL SPEEDOMETER + PROFIT CHART
         ===================================================================== */}
      {activeTool === 'ev' && (
        <section className="rounded-3xl border border-[#1f2e47] bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182438] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{ui.evHeader}</h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">{ui.evSub}</p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] font-mono text-xs font-bold self-start">
              ⚡ {activePreset.label}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 5 Cols: Interactive Sliders */}
            <div className="lg:col-span-5 space-y-5 bg-[#070b12] p-6 rounded-2xl border border-[#19263b] flex flex-col justify-between">
              <div className="space-y-5">
                {/* Bookmaker Odds */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <label className="text-[#cbd5e1] font-bold">{ui.bookieOddsLabel}</label>
                    <span className="text-[#43f08a] font-black text-sm">{evOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1.15}
                      max={6.0}
                      step={0.02}
                      value={evOdds}
                      onChange={(e) => setEvOdds(Number(e.target.value))}
                      className="w-full accent-[#43f08a] cursor-pointer"
                    />
                    <input
                      type="number"
                      step="0.02"
                      min="1.05"
                      value={evOdds}
                      onChange={(e) => setEvOdds(Math.max(1.05, Number(e.target.value)))}
                      className="w-20 bg-[#0d1524] border border-[#263854] rounded-xl px-2.5 py-1.5 text-white font-mono text-sm font-bold text-center"
                    />
                  </div>
                </div>

                {/* True Model Probability */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <label className="text-[#cbd5e1] font-bold">{ui.trueProbLabel}</label>
                    <span className="text-[#43f08a] font-black text-sm">
                      {evTrueProb.toFixed(1)}% (Fair: {fairModelOdds})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={0.5}
                      value={evTrueProb}
                      onChange={(e) => setEvTrueProb(Number(e.target.value))}
                      className="w-full accent-[#43f08a] cursor-pointer"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="99"
                      value={evTrueProb}
                      onChange={(e) =>
                        setEvTrueProb(Math.min(99, Math.max(1, Number(e.target.value))))
                      }
                      className="w-20 bg-[#0d1524] border border-[#263854] rounded-xl px-2.5 py-1.5 text-white font-mono text-sm font-bold text-center"
                    />
                  </div>
                </div>

                {/* Closing Fair Odds (CLV Check) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <label className="text-[#cbd5e1] font-bold">{ui.closingOddsLabel}</label>
                    <span className="text-sky-400 font-black text-sm">
                      {closingFairOdds.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1.15}
                      max={6.0}
                      step={0.02}
                      value={closingFairOdds}
                      onChange={(e) => setClosingFairOdds(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                    <input
                      type="number"
                      step="0.02"
                      min="1.05"
                      value={closingFairOdds}
                      onChange={(e) => setClosingFairOdds(Math.max(1.05, Number(e.target.value)))}
                      className="w-20 bg-[#0d1524] border border-[#263854] rounded-xl px-2.5 py-1.5 text-white font-mono text-sm font-bold text-center"
                    />
                  </div>
                </div>

                {/* Sample Stake */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <label className="text-[#cbd5e1] font-bold">{ui.stakeAmountLabel}</label>
                    <span className="text-white font-black text-sm">{evStake} €</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    step={10}
                    value={evStake}
                    onChange={(e) => setEvStake(Number(e.target.value))}
                    className="w-full accent-[#43f08a] cursor-pointer"
                  />
                </div>
              </div>

              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border text-xs font-mono font-bold ${
                  evResult.evPercentage >= 5
                    ? 'bg-[#082416] border-[#43f08a] text-[#43f08a]'
                    : evResult.evPercentage > 0
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                }`}
              >
                {evResult.evPercentage >= 5
                  ? ui.verdictStrongEv
                  : evResult.evPercentage > 0
                  ? ui.verdictModerateEv
                  : ui.verdictNegativeEv}
              </div>
            </div>

            {/* Right 7 Cols: Creative Analog Speedometer Gauge + 100-Bet Profit Curve */}
            <div className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. ANALOG NEON SPEEDOMETER DIAL FOR +EV */}
                <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] flex flex-col items-center justify-between relative overflow-hidden">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8f9cae] font-bold uppercase">{ui.evEdgeTitle}</span>
                    <span className="px-2 py-0.5 rounded bg-[#101929] text-[#43f08a] font-bold">
                      FAIR: {fairModelOdds}
                    </span>
                  </div>

                  <svg viewBox="0 0 240 145" className="w-full max-w-[250px] h-auto my-1">
                    <defs>
                      <linearGradient id="evGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="42%" stopColor="#f59e0b" />
                        <stop offset="55%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#43f08a" />
                      </linearGradient>
                    </defs>

                    {/* Background Arc */}
                    <path
                      d="M 25 120 A 95 95 0 0 1 215 120"
                      fill="none"
                      stroke="#141e30"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Colored Gradient Arc */}
                    <path
                      d="M 25 120 A 95 95 0 0 1 215 120"
                      fill="none"
                      stroke="url(#evGaugeGrad)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray="298"
                      strokeDashoffset="0"
                    />

                    {/* Scale Labels */}
                    <text x="16" y="138" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      -20%
                    </text>
                    <text x="112" y="16" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      0% FAIR
                    </text>
                    <text x="195" y="138" fill="#43f08a" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      +25%
                    </text>

                    {/* Animated Needle */}
                    <g transform={`translate(120, 120) rotate(${evNeedleAngle})`}>
                      <polygon points="-4,0 0,-82 4,0" fill="#ffffff" />
                      <circle cx="0" cy="0" r="9" fill="#43f08a" stroke="#070b12" strokeWidth="3" />
                    </g>

                    {/* Center Readout */}
                    <text
                      x="120"
                      y="102"
                      textAnchor="middle"
                      fill={evResult.isPositiveEV ? '#43f08a' : '#f87171'}
                      fontSize="22"
                      fontFamily="monospace"
                      fontWeight="900"
                    >
                      {evResult.evPercentage > 0
                        ? `+${evResult.evPercentage}%`
                        : `${evResult.evPercentage}%`}
                    </text>
                  </svg>

                  <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-[#152033]">
                    <span className="text-[#94a3b8]">{ui.clvEdgeTitle}:</span>
                    <span
                      className={`font-black ${
                        clvPercent >= 0 ? 'text-sky-400' : 'text-amber-400'
                      }`}
                    >
                      {clvPercent > 0 ? `+${clvPercent}% CLV` : `${clvPercent}% CLV`}
                    </span>
                  </div>
                </div>

                {/* 2. 100-BET CUMULATIVE PROFIT TRAJECTORY AREA CHART */}
                <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8f9cae] font-bold uppercase">
                      📈 100-BET ROI TRAJECTORY
                    </span>
                    <span
                      className={`font-black ${
                        evResult.expectedProfit >= 0 ? 'text-[#43f08a]' : 'text-red-400'
                      }`}
                    >
                      {evResult.expectedProfit >= 0
                        ? `+${(evResult.expectedProfit * 100).toFixed(0)} €`
                        : `${(evResult.expectedProfit * 100).toFixed(0)} €`}
                    </span>
                  </div>

                  <svg viewBox="0 0 260 135" className="w-full h-auto my-2">
                    {/* Zero Baseline */}
                    <line
                      x1="20"
                      y1="75"
                      x2="245"
                      y2="75"
                      stroke="#334155"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                    />
                    <text x="22" y="70" fill="#64748b" fontSize="8" fontFamily="monospace">
                      0€ Breakeven
                    </text>

                    {(() => {
                      const endY = Math.max(
                        18,
                        Math.min(122, 75 - evResult.evPercentage * 2.4)
                      );
                      const midY = (75 + endY) / 2;
                      const strokeColor = evResult.isPositiveEV ? '#43f08a' : '#f87171';
                      return (
                        <>
                          <polygon
                            points={`20,75 130,${midY} 240,${endY} 240,75`}
                            fill={strokeColor}
                            opacity="0.2"
                          />
                          <polyline
                            points={`20,75 130,${midY} 240,${endY}`}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx="240" cy={endY} r="5" fill={strokeColor} />
                        </>
                      );
                    })()}

                    <text x="20" y="128" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      Bet #1
                    </text>
                    <text x="115" y="128" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      Bet #50
                    </text>
                    <text x="210" y="128" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      Bet #100
                    </text>
                  </svg>

                  <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-[#152033]">
                    <span className="text-[#94a3b8]">{ui.expectedProfitPerBet}:</span>
                    <strong
                      className={evResult.expectedProfit >= 0 ? 'text-[#43f08a]' : 'text-red-400'}
                    >
                      {evResult.expectedProfit >= 0
                        ? `+${evResult.expectedProfit} € / bet`
                        : `${evResult.expectedProfit} € / bet`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Visual Tug-of-War Probability Balance Bar */}
              <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-3.5 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{ui.probComparisonTitle}</span>
                  <span className="text-[#43f08a] font-bold">
                    Δ Edge: {(evTrueProb - evResult.impliedProbability).toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-amber-300">
                      🏦 {ui.impliedBookieProb}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {evResult.impliedProbability}%
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-[#111a2b] overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, evResult.impliedProbability)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#43f08a]">
                      🧠 {ui.trueModelProb}
                    </span>
                    <span className="text-[#43f08a] font-bold">{evTrueProb.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-[#111a2b] overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#10b981] to-[#43f08a] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(67,240,138,0.5)]"
                      style={{ width: `${Math.min(100, evTrueProb)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TOOL 2: 6x6 POISSON & DIXON-COLES + INTERACTIVE TACTICAL FOOTBALL PITCH
         ===================================================================== */}
      {activeTool === 'poisson' && (
        <section className="rounded-3xl border border-[#1f2e47] bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182438] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{ui.poissonHeader}</h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">{ui.poissonSub}</p>
            </div>
            <button
              type="button"
              onClick={() => setUseDixonColes(!useDixonColes)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                useDixonColes
                  ? 'bg-[#43f08a] text-[#04130a] border-[#43f08a] shadow-[0_0_20px_rgba(67,240,138,0.3)]'
                  : 'bg-[#101929] text-[#cbd5e1] border-[#263854]'
              }`}
            >
              {ui.dixonColesToggle}: {useDixonColes ? ui.dixonColesActive : ui.dixonColesOff}
            </button>
          </div>

          {/* LIVE INTERACTIVE TACTICAL FOOTBALL PITCH VISUALIZER */}
          <div className="rounded-2xl bg-[#06150f] border border-[#10b981]/40 p-4 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <span className="text-[#43f08a] font-black">
                ⚽ {activePreset.homeTeam} (λ₁ = {homeXg.toFixed(2)} xG)
              </span>
              <span className="px-3 py-1 rounded-full bg-[#09261a] border border-[#10b981]/40 text-white text-[11px]">
                1X2: {poissonResult.homeWin}% / {poissonResult.draw}% / {poissonResult.awayWin}%
              </span>
              <span className="text-sky-400 font-black">
                ✈️ {activePreset.awayTeam} (λ₂ = {awayXg.toFixed(2)} xG)
              </span>
            </div>

            <svg
              viewBox="0 0 700 220"
              className="w-full h-auto rounded-xl bg-gradient-to-r from-[#062115] via-[#07291a] to-[#061c24] border border-[#10b981]/30"
            >
              {/* Pitch markings */}
              <rect x="15" y="12" width="670" height="196" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.45" />
              <line x1="350" y1="12" x2="350" y2="208" stroke="#10b981" strokeWidth="2" opacity="0.45" />
              <circle cx="350" cy="110" r="36" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.45" />
              <circle cx="350" cy="110" r="3" fill="#43f08a" />

              {/* Left Penalty Box (Home defends, Away attacks) */}
              <rect x="15" y="52" width="95" height="116" fill="none" stroke="#10b981" strokeWidth="1.8" opacity="0.45" />
              <rect x="15" y="80" width="38" height="60" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.45" />

              {/* Right Penalty Box (Away defends, Home attacks) */}
              <rect x="590" y="52" width="95" height="116" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.45" />
              <rect x="647" y="80" width="38" height="60" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.45" />

              {/* Dynamic Home Attacking Shot Zones (Right Box, scaled by homeXg) */}
              <circle
                cx="625"
                cy="110"
                r={Math.min(54, 18 + homeXg * 14)}
                fill="#43f08a"
                opacity="0.28"
              />
              <circle
                cx="645"
                cy="110"
                r={Math.min(32, 10 + homeXg * 9)}
                fill="#43f08a"
                opacity="0.65"
              />
              <text x="625" y="114" textAnchor="middle" fill="#04130a" fontSize="12" fontFamily="monospace" fontWeight="900">
                {homeXg.toFixed(2)} xG
              </text>

              {/* Dynamic Away Attacking Shot Zones (Left Box, scaled by awayXg) */}
              <circle
                cx="75"
                cy="110"
                r={Math.min(54, 18 + awayXg * 14)}
                fill="#38bdf8"
                opacity="0.28"
              />
              <circle
                cx="55"
                cy="110"
                r={Math.min(32, 10 + awayXg * 9)}
                fill="#38bdf8"
                opacity="0.65"
              />
              <text x="75" y="114" textAnchor="middle" fill="#04130a" fontSize="12" fontFamily="monospace" fontWeight="900">
                {awayXg.toFixed(2)} xG
              </text>

              {/* Momentum Arrows */}
              <line
                x1="230"
                y1="78"
                x2={Math.min(575, 320 + homeXg * 85)}
                y2="78"
                stroke="#43f08a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon
                points={`${Math.min(585, 330 + homeXg * 85)},78 ${Math.min(570, 315 + homeXg * 85)},71 ${Math.min(570, 315 + homeXg * 85)},85`}
                fill="#43f08a"
              />

              <line
                x1="470"
                y1="142"
                x2={Math.max(125, 380 - awayXg * 85)}
                y2="142"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon
                points={`${Math.max(115, 370 - awayXg * 85)},142 ${Math.max(130, 385 - awayXg * 85)},135 ${Math.max(130, 385 - awayXg * 85)},149`}
                fill="#38bdf8"
              />
            </svg>

            {/* 1X2 Tug-of-War Segmented Bar */}
            <div className="space-y-1 font-mono text-[11px]">
              <div className="w-full h-4 rounded-full overflow-hidden flex border border-[#1f3b2e]">
                <div
                  style={{ width: `${poissonResult.homeWin}%` }}
                  className="bg-[#43f08a] text-[#04130a] font-black flex items-center justify-center text-[10px] transition-all duration-300"
                >
                  1 ({poissonResult.homeWin}%)
                </div>
                <div
                  style={{ width: `${poissonResult.draw}%` }}
                  className="bg-slate-400 text-[#04130a] font-black flex items-center justify-center text-[10px] transition-all duration-300"
                >
                  X ({poissonResult.draw}%)
                </div>
                <div
                  style={{ width: `${poissonResult.awayWin}%` }}
                  className="bg-sky-400 text-[#04130a] font-black flex items-center justify-center text-[10px] transition-all duration-300"
                >
                  2 ({poissonResult.awayWin}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 5 Cols: xG Sliders + Podium Scorelines */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#cbd5e1] font-bold">{ui.homeXgLabel}</span>
                    <span className="text-[#43f08a] font-black text-base">
                      {homeXg.toFixed(2)} xG
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={3.8}
                    step={0.05}
                    value={homeXg}
                    onChange={(e) => setHomeXg(Number(e.target.value))}
                    className="w-full accent-[#43f08a] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#cbd5e1] font-bold">{ui.awayXgLabel}</span>
                    <span className="text-sky-400 font-black text-base">
                      {awayXg.toFixed(2)} xG
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={3.8}
                    step={0.05}
                    value={awayXg}
                    onChange={(e) => setAwayXg(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Market Odds Comparison Inputs */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#162236] font-mono text-xs">
                  <div>
                    <label className="text-[10px] text-[#8f9cae] block mb-1">
                      {ui.marketHomeOdds}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={mkt1}
                      onChange={(e) => setMkt1(Number(e.target.value))}
                      className="w-full bg-[#0d1524] border border-[#263854] rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8f9cae] block mb-1">
                      {ui.marketDrawOdds}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={mktX}
                      onChange={(e) => setMktX(Number(e.target.value))}
                      className="w-full bg-[#0d1524] border border-[#263854] rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8f9cae] block mb-1">
                      {ui.marketAwayOdds}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={mkt2}
                      onChange={(e) => setMkt2(Number(e.target.value))}
                      className="w-full bg-[#0d1524] border border-[#263854] rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 1X2 + Over 2.5 + BTTS Probability & Fair Odds Cards */}
              <div className="grid grid-cols-3 gap-2.5 font-mono">
                {[
                  {
                    label: ui.probHomeWin,
                    prob: poissonResult.homeWin,
                    fair:
                      poissonResult.homeWin > 0
                        ? (100 / poissonResult.homeWin).toFixed(2)
                        : '-',
                    mkt: mkt1,
                  },
                  {
                    label: ui.probDraw,
                    prob: poissonResult.draw,
                    fair:
                      poissonResult.draw > 0 ? (100 / poissonResult.draw).toFixed(2) : '-',
                    mkt: mktX,
                  },
                  {
                    label: ui.probAwayWin,
                    prob: poissonResult.awayWin,
                    fair:
                      poissonResult.awayWin > 0
                        ? (100 / poissonResult.awayWin).toFixed(2)
                        : '-',
                    mkt: mkt2,
                  },
                ].map((item, idx) => {
                  const ev = Number((((item.prob / 100) * item.mkt - 1) * 100).toFixed(1));
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${
                        ev > 0
                          ? 'bg-[#082416] border-[#43f08a]/60'
                          : 'bg-[#070b12] border-[#19263b]'
                      }`}
                    >
                      <div className="text-[10px] text-[#94a3b8] truncate">{item.label}</div>
                      <div className="text-lg font-black text-white mt-0.5">{item.prob}%</div>
                      <div className="text-[11px] text-[#cbd5e1]">Fair: {item.fair}</div>
                      <div
                        className={`text-[10px] font-bold mt-1 ${
                          ev > 0 ? 'text-[#43f08a]' : 'text-[#64748b]'
                        }`}
                      >
                        EV: {ev > 0 ? `+${ev}%` : `${ev}%`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3.5 rounded-2xl bg-[#070b12] border border-[#19263b] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#8f9cae]">{ui.over25Label}</div>
                    <div className="text-lg font-black text-[#43f08a]">
                      {poissonResult.over25}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#64748b]">Fair</div>
                    <div className="text-sm font-bold text-white">
                      {poissonResult.over25 > 0
                        ? (100 / poissonResult.over25).toFixed(2)
                        : '-'}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#070b12] border border-[#19263b] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#8f9cae]">{ui.bttsLabel}</div>
                    <div className="text-lg font-black text-sky-400">{poissonResult.btts}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#64748b]">Fair</div>
                    <div className="text-sm font-bold text-white">
                      {poissonResult.btts > 0 ? (100 / poissonResult.btts).toFixed(2) : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 5 Exact Scorelines Podium */}
              <div className="p-4 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-2.5 font-mono">
                <div className="text-xs font-bold text-white">🏆 {ui.topScorelinesTitle}</div>
                <div className="grid grid-cols-5 gap-2">
                  {topScorelines.map((s, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-center ${
                        i === 0
                          ? 'bg-[#092618] border-[#43f08a]'
                          : 'bg-[#0d1524] border-[#22344f]'
                      }`}
                    >
                      <div className="text-[10px]">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>
                      <div className="text-xs font-black text-[#43f08a] mt-0.5">{s.score}</div>
                      <div className="text-[11px] text-white font-bold">{s.prob}%</div>
                      <div className="text-[9px] text-[#8f9cae]">@{s.fairOdds}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Interactive 6x6 Scoreline Probability Heatmap */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{ui.matrixTitle}</span>
                <span className="text-[11px] text-sky-400">{ui.awayAxis}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-[10px] text-[#8f9cae] border border-[#162236] bg-[#0b121e]">
                        {ui.homeAxis}
                      </th>
                      {[0, 1, 2, 3, 4, 5].map((a) => (
                        <th
                          key={a}
                          className="p-2 text-sky-400 font-black border border-[#162236] bg-[#0b121e]"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {poissonResult.matrix.map((row, h) => (
                      <tr key={h}>
                        <td className="p-2 font-black text-[#43f08a] border border-[#162236] bg-[#0b121e]">
                          {h}
                        </td>
                        {row.map((prob, a) => {
                          const pct = Number((prob * 100).toFixed(1));
                          const isHot = pct >= 10;
                          const isWarm = pct >= 6 && pct < 10;
                          const isMild = pct >= 3 && pct < 6;
                          return (
                            <td
                              key={a}
                              className={`p-2.5 border border-[#162236] transition-all ${
                                isHot
                                  ? 'bg-[#43f08a] text-[#04130a] font-black shadow-[inset_0_0_12px_rgba(0,0,0,0.25)]'
                                  : isWarm
                                  ? 'bg-[#10b981]/35 text-white font-bold'
                                  : isMild
                                  ? 'bg-[#10b981]/15 text-[#e2e8f0]'
                                  : 'bg-[#090e17] text-[#64748b]'
                              }`}
                            >
                              <div>{pct}%</div>
                              <div className="text-[9px] opacity-80">
                                {h}:{a}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TOOL 3: SHIN & NO-VIG SCANNER + DONUT MARGIN X-RAY & BENCHMARK LADDER
         ===================================================================== */}
      {activeTool === 'novig' && (
        <section className="rounded-3xl border border-[#1f2e47] bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182438] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{ui.noVigHeader}</h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">{ui.noVigSub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNoVigMode('3way')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                  noVigMode === '3way'
                    ? 'bg-[#43f08a] text-[#04130a]'
                    : 'bg-[#101929] text-[#cbd5e1] border border-[#243652]'
                }`}
              >
                {ui.mode3Way}
              </button>
              <button
                type="button"
                onClick={() => setNoVigMode('2way')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                  noVigMode === '2way'
                    ? 'bg-[#43f08a] text-[#04130a]'
                    : 'bg-[#101929] text-[#cbd5e1] border border-[#243652]'
                }`}
              >
                {ui.mode2Way}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Inputs + SVG Donut Margin X-Ray (5 cols) */}
            <div className="lg:col-span-5 space-y-5 bg-[#070b12] p-6 rounded-2xl border border-[#19263b] font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#cbd5e1] block mb-1.5">
                    {ui.odd1Label}
                  </label>
                  <input
                    type="number"
                    step="0.02"
                    min="1.02"
                    value={nvOdds1}
                    onChange={(e) => setNvOdds1(Math.max(1.02, Number(e.target.value)))}
                    className="w-full bg-[#0d1524] border border-[#263854] rounded-xl px-3 py-2.5 text-white font-black text-base"
                  />
                </div>

                {noVigMode === '3way' && (
                  <div>
                    <label className="text-[11px] text-[#cbd5e1] block mb-1.5">
                      {ui.oddXLabel}
                    </label>
                    <input
                      type="number"
                      step="0.02"
                      min="1.02"
                      value={nvOddsX}
                      onChange={(e) => setNvOddsX(Math.max(1.02, Number(e.target.value)))}
                      className="w-full bg-[#0d1524] border border-[#263854] rounded-xl px-3 py-2.5 text-white font-black text-base"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-[#cbd5e1] block mb-1.5">
                    {ui.odd2Label}
                  </label>
                  <input
                    type="number"
                    step="0.02"
                    min="1.02"
                    value={nvOdds2}
                    onChange={(e) => setNvOdds2(Math.max(1.02, Number(e.target.value)))}
                    className="w-full bg-[#0d1524] border border-[#263854] rounded-xl px-3 py-2.5 text-white font-black text-base"
                  />
                </div>
              </div>

              {(() => {
                const margin =
                  noVigMode === '3way' ? noVig3Result.margin : noVig2Result.margin;
                const payout = Number((100 / (1 + margin / 100)).toFixed(1));
                const isLow = margin <= 3.0;
                const isMed = margin > 3.0 && margin <= 6.0;
                const circumference = 2 * Math.PI * 52; // ~326.7
                const payoutArc = (Math.min(100, payout) / 100) * circumference;

                return (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#0b1220] border border-[#1e2e48]">
                      <svg viewBox="0 0 130 130" className="w-28 h-28 shrink-0">
                        <circle
                          cx="65"
                          cy="65"
                          r="52"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="14"
                        />
                        <circle
                          cx="65"
                          cy="65"
                          r="52"
                          fill="none"
                          stroke="#43f08a"
                          strokeWidth="14"
                          strokeDasharray={`${payoutArc} ${circumference}`}
                          transform="rotate(-90 65 65)"
                        />
                        <text
                          x="65"
                          y="62"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="16"
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          {payout}%
                        </text>
                        <text
                          x="65"
                          y="78"
                          textAnchor="middle"
                          fill="#43f08a"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          PAYOUT
                        </text>
                      </svg>

                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] text-[#8f9cae]">
                            {ui.hiddenMarginTitle}
                          </div>
                          <div
                            className={`text-2xl font-black ${
                              isLow
                                ? 'text-[#43f08a]'
                                : isMed
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            {margin}% VIG
                          </div>
                        </div>
                        <div className="text-[11px] text-[#cbd5e1]">
                          {isLow ? ui.marginLow : isMed ? ui.marginMedium : ui.marginHigh}
                        </div>
                      </div>
                    </div>

                    {/* Visual Industry Margin Benchmark Ladder */}
                    <div className="space-y-2 text-[11px]">
                      {[
                        { name: 'Pinnacle Sharp Benchmark', val: 1.8, col: 'bg-[#43f08a]' },
                        { name: 'Your Current Market Odds', val: Math.max(0.5, margin), col: isLow ? 'bg-[#43f08a]' : isMed ? 'bg-amber-400' : 'bg-red-500' },
                        { name: 'Retail Soft Bookmaker Avg', val: 5.8, col: 'bg-slate-500' },
                      ].map((b, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[#cbd5e1]">{b.name}</span>
                            <span className="text-white font-bold">{b.val}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#121c2e] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${b.col}`}
                              style={{ width: `${Math.min(100, b.val * 10)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Fair No-Vig Comparison Table + Visual Probability Bars (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#070b12] border border-[#19263b] font-mono flex flex-col justify-between space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#182438] text-[11px] text-[#8f9cae]">
                      <th className="pb-3">Outcome</th>
                      <th className="pb-3">{ui.bookiePrice}</th>
                      <th className="pb-3 text-[#43f08a]">{ui.fairNoVigPrice}</th>
                      <th className="pb-3">{ui.trueProbCol}</th>
                      <th className="pb-3">{ui.taxCutCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141f30]">
                    {(noVigMode === '3way'
                      ? [
                          {
                            name: ui.outcomeHome,
                            raw: nvOdds1,
                            fair: noVig3Result.fairHomeOdds,
                            prob: noVig3Result.trueHomeProb,
                          },
                          {
                            name: ui.outcomeDraw,
                            raw: nvOddsX,
                            fair: noVig3Result.fairDrawOdds,
                            prob: noVig3Result.trueDrawProb,
                          },
                          {
                            name: ui.outcomeAway,
                            raw: nvOdds2,
                            fair: noVig3Result.fairAwayOdds,
                            prob: noVig3Result.trueAwayProb,
                          },
                        ]
                      : [
                          {
                            name: ui.outcomeHome,
                            raw: nvOdds1,
                            fair: noVig2Result.fairOddsA,
                            prob: noVig2Result.trueProbA,
                          },
                          {
                            name: ui.outcomeAway,
                            raw: nvOdds2,
                            fair: noVig2Result.fairOddsB,
                            prob: noVig2Result.trueProbB,
                          },
                        ]
                    ).map((row, rIdx) => {
                      const taxPct =
                        row.fair > 0
                          ? Number((((row.raw - row.fair) / row.fair) * 100).toFixed(1))
                          : 0;
                      return (
                        <tr key={rIdx}>
                          <td className="py-4 font-bold text-white">{row.name}</td>
                          <td className="py-4 text-[#cbd5e1]">{row.raw.toFixed(2)}</td>
                          <td className="py-4 font-black text-base text-[#43f08a]">
                            {row.fair.toFixed(2)}
                          </td>
                          <td className="py-4 text-sky-400 font-bold">{row.prob}%</td>
                          <td className="py-4 text-amber-400">{taxPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visual True Probability Split Bar */}
              <div className="space-y-2 pt-3 border-t border-[#152033]">
                <div className="text-xs text-[#94a3b8]">
                  100.0% No-Vig True Probability Distribution
                </div>
                <div className="w-full h-5 rounded-xl overflow-hidden flex font-black text-[10px] text-[#04130a]">
                  {noVigMode === '3way' ? (
                    <>
                      <div
                        style={{ width: `${noVig3Result.trueHomeProb}%` }}
                        className="bg-[#43f08a] flex items-center justify-center"
                      >
                        1 ({noVig3Result.trueHomeProb}%)
                      </div>
                      <div
                        style={{ width: `${noVig3Result.trueDrawProb}%` }}
                        className="bg-amber-300 flex items-center justify-center"
                      >
                        X ({noVig3Result.trueDrawProb}%)
                      </div>
                      <div
                        style={{ width: `${noVig3Result.trueAwayProb}%` }}
                        className="bg-sky-400 flex items-center justify-center"
                      >
                        2 ({noVig3Result.trueAwayProb}%)
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{ width: `${noVig2Result.trueProbA}%` }}
                        className="bg-[#43f08a] flex items-center justify-center"
                      >
                        A ({noVig2Result.trueProbA}%)
                      </div>
                      <div
                        style={{ width: `${noVig2Result.trueProbB}%` }}
                        className="bg-sky-400 flex items-center justify-center"
                      >
                        B ({noVig2Result.trueProbB}%)
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TOOL 4: KELLY CRITERION + LIVE 50-BET MONTE CARLO EQUITY FAN CHART
         ===================================================================== */}
      {activeTool === 'kelly' && (
        <section className="rounded-3xl border border-[#1f2e47] bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#182438] pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">{ui.kellyHeader}</h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">{ui.kellySub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4 bg-[#070b12] p-6 rounded-2xl border border-[#19263b] font-mono">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#cbd5e1] font-bold">{ui.bankrollLabel}</span>
                  <span className="text-[#43f08a] font-black">{kellyBankroll} €</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={25000}
                  step={100}
                  value={kellyBankroll}
                  onChange={(e) => setKellyBankroll(Number(e.target.value))}
                  className="w-full accent-[#43f08a] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#cbd5e1] font-bold">{ui.bookieOddsLabel}</span>
                  <span className="text-white font-black">{evOdds.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={1.2}
                  max={5.0}
                  step={0.05}
                  value={evOdds}
                  onChange={(e) => setEvOdds(Number(e.target.value))}
                  className="w-full accent-[#43f08a] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#cbd5e1] font-bold">{ui.trueProbLabel}</span>
                  <span className="text-[#43f08a] font-black">{evTrueProb.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  step={0.5}
                  value={evTrueProb}
                  onChange={(e) => setEvTrueProb(Number(e.target.value))}
                  className="w-full accent-[#43f08a] cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs text-[#cbd5e1] font-bold">
                  {ui.kellyMultiplierLabel}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0.25, label: '0.25x Quarter' },
                    { val: 0.5, label: '0.50x Half' },
                    { val: 1.0, label: '1.00x Full' },
                  ].map((f) => (
                    <button
                      key={f.val}
                      type="button"
                      onClick={() => setKellyFraction(f.val)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold cursor-pointer border ${
                        kellyFraction === f.val
                          ? 'bg-[#43f08a] text-[#04130a] border-[#43f08a]'
                          : 'bg-[#0d1524] text-[#cbd5e1] border-[#243652]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#082416] border border-[#43f08a]">
                  <div className="text-[10px] text-[#cbd5e1]">{ui.recommendedStakeTitle}</div>
                  <div className="text-2xl font-black text-[#43f08a] mt-1">
                    {activeKelly.recommendedStake} €
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#0b1322] border border-[#1e2e48]">
                  <div className="text-[10px] text-[#8f9cae]">{ui.bankrollShareTitle}</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {activeKelly.fractionalKellyPercentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: LIVE MONTE CARLO EQUITY CONE SVG + KELLY TIERS */}
            <div className="lg:col-span-7 space-y-4 font-mono">
              <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-white">
                    🎲 50-BET MONTE CARLO BANKROLL CONE ({kellyFraction}x KELLY)
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-[#43f08a]">
                      ● Median: {kellyFanPaths.projectedMedianEur} €
                    </span>
                    <span className="text-sky-400">
                      ▲ 90th Pct: {kellyFanPaths.projectedBullEur} €
                    </span>
                  </div>
                </div>

                <svg
                  viewBox="0 0 490 185"
                  className="w-full h-auto rounded-xl bg-[#05080f] border border-[#162236]"
                >
                  {/* Grid Lines */}
                  {[40, 80, 120, 160].map((gy) => (
                    <line
                      key={gy}
                      x1="30"
                      y1={gy}
                      x2="470"
                      y2={gy}
                      stroke="#111b2b"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Starting Bankroll Baseline */}
                  <line
                    x1="30"
                    y1={kellyFanPaths.baselineY}
                    x2="470"
                    y2={kellyFanPaths.baselineY}
                    stroke="#475569"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />

                  {/* Shaded Confidence Fan Polygon */}
                  <polygon
                    points={kellyFanPaths.areaPolygon}
                    fill="#43f08a"
                    opacity="0.16"
                  />

                  {/* Upper 90th Percentile Path */}
                  <path
                    d={kellyFanPaths.bullLine}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />

                  {/* Median Compounding Trajectory */}
                  <path
                    d={kellyFanPaths.medianLine}
                    fill="none"
                    stroke="#43f08a"
                    strokeWidth="3.2"
                  />

                  {/* Lower 10th Percentile Drawdown Floor */}
                  <path
                    d={kellyFanPaths.bearLine}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />

                  <text x="34" y="178" fill="#8f9cae" fontSize="9" fontFamily="monospace">
                    Start ({kellyBankroll}€)
                  </text>
                  <text x="230" y="178" fill="#8f9cae" fontSize="9" fontFamily="monospace">
                    Bet #25
                  </text>
                  <text x="415" y="178" fill="#43f08a" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    Bet #50
                  </text>
                </svg>
              </div>

              {/* Comparison Cards for Quarter vs Half vs Full Kelly */}
              <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-3">
                <div className="text-xs font-bold text-white">
                  {ui.riskProfileComparison}
                </div>
                {[
                  {
                    title: ui.quarterKellyTag,
                    pct: kellyQuarter.fractionalKellyPercentage,
                    eur: kellyQuarter.recommendedStake,
                    risk: ui.riskLow,
                    color: 'bg-[#43f08a]',
                  },
                  {
                    title: ui.halfKellyTag,
                    pct: kellyHalf.fractionalKellyPercentage,
                    eur: kellyHalf.recommendedStake,
                    risk: ui.riskModerate,
                    color: 'bg-sky-400',
                  },
                  {
                    title: ui.fullKellyTag,
                    pct: kellyFull.fractionalKellyPercentage,
                    eur: kellyFull.recommendedStake,
                    risk: ui.riskHigh,
                    color: 'bg-amber-400',
                  },
                ].map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0c1322] border border-[#1d2c45] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{tier.title}</span>
                      <span className="text-[#43f08a] font-black">
                        {tier.pct}% ({tier.eur} €)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#141f33] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${tier.color}`}
                        style={{ width: `${Math.min(100, tier.pct * 5)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#8f9cae]">{tier.risk}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TOOL 5: DUTCHING & ARBITRAGE SPLITTER + CAPITAL WHEEL & PAYOUT TOWERS
         ===================================================================== */}
      {activeTool === 'dutching' && (
        <section className="rounded-3xl border border-[#1f2e47] bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182438] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{ui.dutchHeader}</h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">{ui.dutchSub}</p>
            </div>
            {dutchSelections.length < 4 && (
              <button
                type="button"
                onClick={() =>
                  setDutchSelections([
                    ...dutchSelections,
                    { label: `Selection ${dutchSelections.length + 1}`, odds: 9.0 },
                  ])
                }
                className="px-4 py-2 rounded-xl bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] text-xs font-mono font-bold cursor-pointer self-start"
              >
                {ui.addSelectionBtn}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono">
            <div className="lg:col-span-5 space-y-5 bg-[#070b12] p-6 rounded-2xl border border-[#19263b]">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#cbd5e1] font-bold">{ui.totalBudgetLabel}</span>
                  <span className="text-[#43f08a] font-black">{dutchBudget} €</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={2000}
                  step={10}
                  value={dutchBudget}
                  onChange={(e) => setDutchBudget(Number(e.target.value))}
                  className="w-full accent-[#43f08a] cursor-pointer"
                />
              </div>

              <div className="space-y-3 pt-2">
                {dutchSelections.map((sel, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          ['#43f08a', '#38bdf8', '#f59e0b', '#c084fc'][idx % 4],
                      }}
                    />
                    <input
                      type="text"
                      value={sel.label}
                      onChange={(e) => {
                        const next = [...dutchSelections];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setDutchSelections(next);
                      }}
                      className="flex-1 bg-[#0d1524] border border-[#243652] rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="1.1"
                      value={sel.odds}
                      onChange={(e) => {
                        const next = [...dutchSelections];
                        next[idx] = {
                          ...next[idx],
                          odds: Math.max(1.1, Number(e.target.value)),
                        };
                        setDutchSelections(next);
                      }}
                      className="w-24 bg-[#0d1524] border border-[#43f08a]/40 rounded-xl px-3 py-2 text-sm text-[#43f08a] font-black text-center"
                    />
                    {dutchSelections.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDutchSelections(dutchSelections.filter((_, i) => i !== idx))
                        }
                        className="px-2.5 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Capital Allocation Segmented Bar */}
              <div className="space-y-2 pt-3 border-t border-[#162236]">
                <div className="text-[11px] text-[#94a3b8]">
                  Capital Split ({dutchBudget} € Total)
                </div>
                <div className="w-full h-4 rounded-full overflow-hidden flex">
                  {dutchResult.rows.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        width: `${r.sharePct}%`,
                        backgroundColor: r.color,
                      }}
                      className="h-full transition-all duration-300"
                      title={`${r.label}: ${r.stake}€`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#070b12] border border-[#19263b]">
                  <div className="text-[10px] text-[#8f9cae]">
                    {ui.combinedMarginLabel}
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {dutchResult.sumImpliedPct}%
                  </div>
                </div>
                <div
                  className={`p-4 rounded-2xl border ${
                    dutchResult.netProfit > 0
                      ? 'bg-[#082416] border-[#43f08a]'
                      : 'bg-red-950/30 border-red-500/40'
                  }`}
                >
                  <div className="text-[10px] text-[#cbd5e1]">
                    {ui.equalNetProfitLabel}
                  </div>
                  <div
                    className={`text-xl font-black mt-1 ${
                      dutchResult.netProfit > 0 ? 'text-[#43f08a]' : 'text-red-400'
                    }`}
                  >
                    {dutchResult.netProfit > 0
                      ? `+${dutchResult.netProfit} €`
                      : `${dutchResult.netProfit} €`}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#070b12] border border-[#19263b]">
                  <div className="text-[10px] text-[#8f9cae]">{ui.roiPercentLabel}</div>
                  <div
                    className={`text-xl font-black mt-1 ${
                      dutchResult.roiPct > 0 ? 'text-[#43f08a]' : 'text-red-400'
                    }`}
                  >
                    {dutchResult.roiPct > 0
                      ? `+${dutchResult.roiPct}%`
                      : `${dutchResult.roiPct}%`}
                  </div>
                </div>
              </div>

              {/* VISUAL EQUAL-PAYOUT TOWERS */}
              <div className="p-5 rounded-2xl bg-[#070b12] border border-[#19263b] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    🏛️ EQUALIZED PAYOUT TOWERS (RETURN: {dutchResult.avgReturn.toFixed(2)} €)
                  </span>
                  <span className="text-[#43f08a]">
                    {ui.totalBudgetLabel}: {dutchBudget} €
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {dutchResult.rows.map((r, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#0b1322] border border-[#1d2d47] flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white truncate">{r.label}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-black text-[#04130a]"
                          style={{ backgroundColor: r.color }}
                        >
                          @{r.odds.toFixed(2)}
                        </span>
                      </div>

                      {/* Visual Tower Bar */}
                      <div className="h-20 w-full bg-[#070b12] rounded-lg border border-[#182438] p-1.5 flex items-end gap-1.5">
                        <div
                          className="w-1/2 rounded-t transition-all duration-300"
                          style={{
                            height: `${Math.max(15, r.sharePct)}%`,
                            backgroundColor: r.color,
                          }}
                          title={`Stake: ${r.stake}€`}
                        />
                        <div
                          className="w-1/2 h-full rounded-t bg-[#43f08a]/30 border-t-2 border-[#43f08a]"
                          title={`Return: ${r.totalReturn}€`}
                        />
                      </div>

                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#8f9cae]">Stake:</span>
                          <strong className="text-white">{r.stake.toFixed(2)} €</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8f9cae]">Return:</span>
                          <strong className="text-[#43f08a]">
                            {r.totalReturn.toFixed(2)} €
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border text-xs font-bold ${
                  dutchResult.netProfit > 0
                    ? 'bg-[#082416] border-[#43f08a] text-[#43f08a]'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                {dutchResult.netProfit > 0
                  ? ui.dutchPositiveVerdict
                  : ui.dutchNegativeVerdict}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
